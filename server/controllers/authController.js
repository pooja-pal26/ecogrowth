const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');

const jsonDb = require('../services/jsonDb');

// Legacy PHP hash algorithm: sha1(md5(password))
const legacyHash = (password) => {
  const md5 = crypto.createHash('md5').update(password).digest('hex');
  return crypto.createHash('sha1').update(md5).digest('hex');
};

const getRoleDetails = (roleId, roleTypeId) => {
  const roles = jsonDb.getTable('tbl_roles') || [];
  const roleTypes = jsonDb.getTable('tbl_role_type') || [];

  const matchedRole = roles.find(r => String(r.id) === String(roleId) || String(r._id) === String(roleId));
  const matchedRoleType = roleTypes.find(rt => String(rt.id) === String(roleTypeId) || String(rt._id) === String(roleTypeId));

  const roleName = matchedRole ? matchedRole.role : 'User';
  const roleTypeName = matchedRoleType ? matchedRoleType.role_type : 'Staff';

  const rId = String(roleId || '');
  const rNameLower = roleName.toLowerCase();

  let roleKey = 'user';
  if (rId === '1' || rId === '17' || rNameLower.includes('admin')) {
    roleKey = 'admin';
  } else if (rId === '16' || rNameLower.includes('accountant') || rId === '4' || rNameLower.includes('cfo')) {
    roleKey = 'accountant';
  } else if (rId === '15' || rNameLower.includes('supervisor')) {
    roleKey = 'supervisor';
  } else if (rId === '10' || rId === '11' || rNameLower.includes('project')) {
    roleKey = 'project_manager';
  } else if (['2', '3', '6', '7', '8', '9', '25'].includes(rId) || rNameLower.includes('chief') || rNameLower.includes('president') || rNameLower.includes('director')) {
    roleKey = 'management';
  } else if (rId === '14' || rNameLower.includes('human resource') || rNameLower.includes('hr')) {
    roleKey = 'hr';
  }

  return {
    role_id: rId,
    role_name: roleName,
    role_type_id: String(roleTypeId || ''),
    role_type_name: roleTypeName,
    role_key: roleKey
  };
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
      // Check legacy PHP hashes: sha1(md5(password)), sha1(password), or plain password
      const hashedProvided = legacyHash(password);
      const sha1Provided = crypto.createHash('sha1').update(password).digest('hex');
      if (
        user.password === hashedProvided ||
        user.password === sha1Provided ||
        user.password === password ||
        user.plain_password === password
      ) {
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

    // Resolve role details
    const roleDetails = getRoleDetails(user.role, user.role_type);

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email_id,
      role: user.role,
      role_type: user.role_type,
      role_name: roleDetails.role_name,
      role_key: roleDetails.role_key
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
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email_id,
        email_id: user.email_id,
        role: user.role,
        role_type: user.role_type,
        role_name: roleDetails.role_name,
        role_type_name: roleDetails.role_type_name,
        role_key: roleDetails.role_key,
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

    const roleDetails = getRoleDetails(user.role, user.role_type);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email_id,
        email_id: user.email_id,
        role: user.role,
        role_type: user.role_type,
        role_name: roleDetails.role_name,
        role_type_name: roleDetails.role_type_name,
        role_key: roleDetails.role_key,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
