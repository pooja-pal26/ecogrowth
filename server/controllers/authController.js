const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Legacy PHP hash algorithm: sha1(md5(password))
const legacyHash = (password) => {
  const md5 = crypto.createHash('md5').update(password).digest('hex');
  return crypto.createHash('sha1').update(md5).digest('hex');
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email_id: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check account deletion and active status (matching PHP behavior)
    if (user.is_deleted === 1) {
      return res.status(403).json({ message: 'Account has been removed. Please contact administrator.' });
    }

    if (user.status === 0) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact administrator.' });
    }

    let isMatch = false;
    let shouldUpgradeHash = false;

    // Check bcrypt hash
    if (user.password.startsWith('$2') || user.password.startsWith('`$2')) {
      const cleanHash = user.password.startsWith('`') ? user.password.slice(1) : user.password;
      isMatch = await bcrypt.compare(password, cleanHash);
    } else {
      // Check legacy PHP hash: sha1(md5(password))
      const hashedProvided = legacyHash(password);
      if (user.password === hashedProvided) {
        isMatch = true;
        shouldUpgradeHash = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Transparently upgrade legacy hash to bcrypt without security degradation
    if (shouldUpgradeHash) {
      try {
        const upgradedHash = await bcrypt.hash(password, 10);
        user.password = upgradedHash;
      } catch (hashErr) {
        console.warn('[AUTH WARNING] Could not upgrade legacy hash:', hashErr.message);
      }
    }

    // Update login timestamp
    user.login_time = new Date();
    await user.save();

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email_id,
      role: user.role,
      role_type: user.role_type
    };

    const token = jwt.sign(tokenPayload, config.auth.jwtSecret, {
      expiresIn: config.auth.tokenExpiresIn
    });

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge: config.auth.cookieMaxAgeMs
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email_id,
        email_id: user.email_id,
        role: user.role,
        role_type: user.role_type,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -plain_password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.is_deleted === 1 || user.status === 0) {
      res.clearCookie('token');
      return res.status(403).json({ success: false, message: 'Account is no longer active' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email_id,
        email_id: user.email_id,
        role: user.role,
        role_type: user.role_type,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
