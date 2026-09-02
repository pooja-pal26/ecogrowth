const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_me_in_production';

// Legacy PHP hash: sha1(md5(password))
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

    console.log('[AUTH DEBUG] Login attempt for email:', email);
    const user = await User.findOne({ email_id: email });
    if (!user) {
      console.log('[AUTH DEBUG] User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('[AUTH DEBUG] User found:', { id: user._id, email_id: user.email_id, role: user.role });
    console.log('[AUTH DEBUG] DB Password Hash:', user.password);
    
    let isMatch = false;
    
    if (user.password.startsWith('$2') || user.password.startsWith('`$2')) {
      console.log('[AUTH DEBUG] Checking as bcrypt hash');
      isMatch = await bcrypt.compare(password, user.password);
      console.log('[AUTH DEBUG] Bcrypt match result:', isMatch);
    } else {
      const hashedProvided = legacyHash(password);
      console.log('[AUTH DEBUG] Checking as legacy hash. Provided hashed:', hashedProvided);
      if (user.password === hashedProvided) {
        isMatch = true;
      }
      console.log('[AUTH DEBUG] Legacy match result:', isMatch);
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: {
      id: user._id,
      name: user.name,
      email: user.email_id,
      role: user.role
    }});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
