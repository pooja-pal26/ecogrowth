const jsonDb = require('../services/jsonDb');
const crypto = require('crypto');

/**
 * Helper to format date strings to DD/MM/YYYY
 */
const formatDateDMY = (dateStr) => {
  if (!dateStr || dateStr === '0000-00-00' || dateStr === '0') return '-';
  const clean = String(dateStr).split(' ')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return clean;
};

/**
 * Helper to convert DD/MM/YYYY or YYYY-MM-DD into YYYY-MM-DD
 */
const toStandardDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().substring(0, 10);
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return dateStr.substring(0, 10);
};

/**
 * GET /api/users/master-data
 * Returns departments, role types, and roles for dropdown population
 */
exports.getUserMasterData = async (req, res) => {
  try {
    const departments = (jsonDb.getTable('cairn_department') || [])
      .filter(d => String(d.status) === '1')
      .map(d => ({
        id: String(d.id),
        department: d.department
      }))
      .sort((a, b) => (a.department || '').localeCompare(b.department || ''));

    const roleTypes = (jsonDb.getTable('tbl_role_type') || [])
      .filter(rt => String(rt.status) === '1')
      .map(rt => ({
        id: String(rt.id),
        role_type: rt.role_type
      }));

    const roles = (jsonDb.getTable('tbl_roles') || [])
      .filter(r => String(r.status) === '1')
      .map(r => ({
        id: String(r.id),
        role_type: String(r.role_type),
        role: r.role
      }))
      .sort((a, b) => (a.role || '').localeCompare(b.role || ''));

    res.json({
      success: true,
      data: {
        departments,
        roleTypes,
        roles
      }
    });
  } catch (error) {
    console.error('Error in getUserMasterData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/users
 * Returns list of active or deactivated users with department and role labels
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { status = 'active', search = '', department = '' } = req.query;

    const rawUsers = jsonDb.getTable('tbl_user') || [];
    const departments = jsonDb.getTable('cairn_department') || [];
    const roleTypes = jsonDb.getTable('tbl_role_type') || [];
    const roles = jsonDb.getTable('tbl_roles') || [];

    // Map lookups for fast resolution
    const deptMap = {};
    departments.forEach(d => { deptMap[String(d.id)] = d.department; });

    const roleTypeMap = {};
    roleTypes.forEach(rt => { roleTypeMap[String(rt.id)] = rt.role_type; });

    const roleMap = {};
    roles.forEach(r => { roleMap[String(r.id)] = r.role; });

    // Filter by status & deletion flag
    let list = rawUsers.filter(u => {
      const isDeleted = String(u.is_deleted) === '1';
      if (isDeleted) return false;

      const userStatus = String(u.status);
      if (status === 'deactive' || status === 'inactive') {
        return userStatus === '0';
      }
      // default: active
      return userStatus === '1';
    });

    // Enrich with names and formatted dates
    let enriched = list.map(u => {
      const dName = deptMap[String(u.department)] || u.department || '-';
      const rtName = roleTypeMap[String(u.role_type)] || u.role_type || '-';
      const rName = roleMap[String(u.role)] || u.role || '-';

      return {
        id: String(u.id || u._id),
        _id: u._id || u.id,
        name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unnamed',
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        contact_no: u.contact_no || '',
        alternate_mobile: u.alternate_mobile || '',
        email_id: u.email_id || '',
        department: String(u.department || ''),
        department_name: dName,
        role_type: String(u.role_type || ''),
        role_type_name: rtName,
        role: String(u.role || ''),
        role_name: rName,
        date_of_joining: u.date_of_joining || '',
        formattedDOJ: formatDateDMY(u.date_of_joining),
        updated: u.updated || '',
        formattedUpdated: formatDateDMY(u.updated),
        permanent_address: u.permanent_address || '',
        current_address: u.current_address || '',
        profile_path: u.profile_path || '',
        status: String(u.status || '1'),
        is_deleted: String(u.is_deleted || '0'),
        device_id: u.device_id || ''
      };
    });

    // Optional department filter
    if (department) {
      enriched = enriched.filter(u => String(u.department) === String(department));
    }

    // Optional search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.contact_no && u.contact_no.toLowerCase().includes(q)) ||
        (u.email_id && u.email_id.toLowerCase().includes(q)) ||
        (u.department_name && u.department_name.toLowerCase().includes(q)) ||
        (u.role_name && u.role_name.toLowerCase().includes(q))
      );
    }

    // Sort descending by id
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({
      success: true,
      data: enriched,
      count: enriched.length
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/users/:id
 * Returns single user profile with all relational labels resolved
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const rawUsers = jsonDb.getTable('tbl_user') || [];
    const target = rawUsers.find(u => String(u.id || u._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const departments = jsonDb.getTable('cairn_department') || [];
    const roleTypes = jsonDb.getTable('tbl_role_type') || [];
    const roles = jsonDb.getTable('tbl_roles') || [];

    const dept = departments.find(d => String(d.id) === String(target.department));
    const rt = roleTypes.find(r => String(r.id) === String(target.role_type));
    const r = roles.find(ro => String(ro.id) === String(target.role));

    const userProfile = {
      ...target,
      id: String(target.id || target._id),
      name: target.name || `${target.first_name || ''} ${target.last_name || ''}`.trim(),
      department_name: dept ? dept.department : target.department,
      role_type_name: rt ? rt.role_type : target.role_type,
      role_name: r ? r.role : target.role,
      formattedDOJ: formatDateDMY(target.date_of_joining),
      formattedUpdated: formatDateDMY(target.updated)
    };

    res.json({ success: true, data: userProfile });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/users
 * Replicates PHP createUserAction with validation and duplicate mobile/email checks
 */
exports.createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      mobile_number,
      contact_no,
      alternate_mobile,
      email_id,
      department,
      role_type,
      role,
      doj,
      date_of_joining,
      p_address,
      permanent_address,
      c_address,
      current_address,
      password,
      confirmPassword,
      profile_pic,
      profile_path
    } = req.body;

    // Field extractions & fallbacks
    const fName = (first_name || '').trim();
    const lName = (last_name || '').trim();
    const mobile = (mobile_number || contact_no || '').trim();
    const altMobile = (alternate_mobile || '').trim();
    const email = (email_id || '').trim();
    const deptId = String(department || '').trim();
    const roleTypeId = String(role_type || '').trim();
    const roleId = String(role || '').trim();
    const joinDate = toStandardDate(doj || date_of_joining);
    const permAddress = (p_address || permanent_address || '').trim().toUpperCase();
    const currAddress = (c_address || current_address || '').trim().toUpperCase();
    const pwd = (password || '').trim();

    // 1. Mandatory Validations matching PHP validateUser()
    if (!fName) {
      return res.status(400).json({ success: false, message: 'Please Enter First Name' });
    }
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Please Enter Mobile Number' });
    }
    if (isNaN(mobile) || mobile.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please Enter 10 Digit Mobile Number' });
    }
    if (altMobile && (isNaN(altMobile) || altMobile.length !== 10)) {
      return res.status(400).json({ success: false, message: 'Please Enter 10 Digit Alternate Mobile Number' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please Enter Valid Email ID' });
    }
    if (!deptId) {
      return res.status(400).json({ success: false, message: 'Please Select Department' });
    }
    if (!roleTypeId) {
      return res.status(400).json({ success: false, message: 'Please Select Role Type' });
    }
    if (!roleId) {
      return res.status(400).json({ success: false, message: 'Please Select Role' });
    }
    if (!joinDate) {
      return res.status(400).json({ success: false, message: 'Please Select Date of Joining' });
    }
    if (!pwd) {
      return res.status(400).json({ success: false, message: 'Please Enter Password' });
    }
    if (confirmPassword && confirmPassword.trim() !== pwd) {
      return res.status(400).json({ success: false, message: 'Confirm Password should be same as Password' });
    }

    // 2. Duplicate Checks matching PHP createUserAction()
    const allUsers = jsonDb.getTable('tbl_user') || [];
    const mobileExists = allUsers.some(u => 
      String(u.is_deleted) !== '1' && 
      u.contact_no && 
      u.contact_no.trim() === mobile
    );
    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: 'Entered Mobile number already exists in the system.'
      });
    }

    const emailExists = allUsers.some(u =>
      String(u.is_deleted) !== '1' &&
      u.email_id &&
      u.email_id.trim().toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Entered Email already exists in the system.'
      });
    }

    // 3. Format Data
    const upperFirst = fName.toUpperCase();
    const upperLast = lName ? lName.toUpperCase() : '';
    const fullName = upperLast ? `${upperFirst} ${upperLast}` : upperFirst;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newUser = jsonDb.insert('tbl_user', {
      name: fullName,
      first_name: upperFirst,
      last_name: upperLast,
      email_id: email,
      contact_no: mobile,
      alternate_mobile: altMobile,
      department: deptId,
      role_type: roleTypeId,
      role: roleId,
      date_of_joining: joinDate,
      permanent_address: permAddress,
      current_address: currAddress,
      profile_path: profile_path || profile_pic || '',
      password: crypto.createHash('md5').update(pwd).digest('hex'),
      plain_password: pwd,
      status: '1',
      is_deleted: '0',
      device_id: '',
      firebase_token: '',
      access_token: '',
      created_on: nowStr,
      created_by: String(req.user?.id || '1'),
      updated: nowStr.substring(0, 10)
    });

    res.status(201).json({
      success: true,
      message: 'User has been created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/users/:id
 * Replicates PHP editUserInfoAction with duplicate checks excluding current user
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      mobile_number,
      contact_no,
      alternate_mobile,
      email_id,
      department,
      role_type,
      role,
      doj,
      date_of_joining,
      p_address,
      permanent_address,
      c_address,
      current_address,
      password,
      profile_path
    } = req.body;

    const allUsers = jsonDb.getTable('tbl_user') || [];
    const current = allUsers.find(u => String(u.id || u._id) === String(id));
    if (!current) {
      return res.status(404).json({ success: false, message: 'User not found to update' });
    }

    const mobile = (mobile_number || contact_no || current.contact_no || '').trim();
    const email = (email_id || current.email_id || '').trim();

    // Duplicate mobile check excluding current user
    if (mobile && mobile !== (current.contact_no || '').trim()) {
      if (isNaN(mobile) || mobile.length !== 10) {
        return res.status(400).json({ success: false, message: 'Please Enter 10 Digit Mobile Number' });
      }
      const duplicateMobile = allUsers.some(u =>
        String(u.id || u._id) !== String(id) &&
        String(u.is_deleted) !== '1' &&
        u.contact_no &&
        u.contact_no.trim() === mobile
      );
      if (duplicateMobile) {
        return res.status(400).json({
          success: false,
          message: 'Entered Mobile number already exists in the system.'
        });
      }
    }

    // Duplicate email check excluding current user
    if (email && email.toLowerCase() !== (current.email_id || '').trim().toLowerCase()) {
      const duplicateEmail = allUsers.some(u =>
        String(u.id || u._id) !== String(id) &&
        String(u.is_deleted) !== '1' &&
        u.email_id &&
        u.email_id.trim().toLowerCase() === email.toLowerCase()
      );
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: 'Entered Email already exists in the system.'
        });
      }
    }

    const fName = first_name !== undefined ? first_name.trim().toUpperCase() : current.first_name;
    const lName = last_name !== undefined ? last_name.trim().toUpperCase() : (current.last_name || '');
    const fullName = lName ? `${fName} ${lName}` : fName;
    const nowDay = new Date().toISOString().substring(0, 10);

    const updateFields = {
      name: fullName,
      first_name: fName,
      last_name: lName,
      contact_no: mobile,
      email_id: email,
      updated: nowDay
    };

    if (alternate_mobile !== undefined) updateFields.alternate_mobile = alternate_mobile.trim();
    if (department !== undefined) updateFields.department = String(department);
    if (role_type !== undefined) updateFields.role_type = String(role_type);
    if (role !== undefined) updateFields.role = String(role);
    if (doj || date_of_joining) updateFields.date_of_joining = toStandardDate(doj || date_of_joining);
    if (p_address || permanent_address) updateFields.permanent_address = (p_address || permanent_address).trim().toUpperCase();
    if (c_address || current_address) updateFields.current_address = (c_address || current_address).trim().toUpperCase();
    if (profile_path) updateFields.profile_path = profile_path;

    if (password && password.trim()) {
      updateFields.plain_password = password.trim();
      updateFields.password = crypto.createHash('md5').update(password.trim()).digest('hex');
    }

    jsonDb.update('tbl_user', current._id || current.id, updateFields);

    res.json({
      success: true,
      message: 'User details have been updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/users/:id/deactivate
 * Replicates PHP deactivateUserProfileAction
 */
exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = jsonDb.getTable('tbl_user') || [];
    const target = allUsers.find(u => String(u.id || u._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, message: 'User ID is missing. Please try again' });
    }

    const nowDay = new Date().toISOString().substring(0, 10);
    jsonDb.update('tbl_user', target._id || target.id, {
      status: '0',
      updated: nowDay
    });

    const userName = target.name || 'User';
    res.json({
      success: true,
      flag: true,
      message: `${userName} has been deactivated successfully.`
    });
  } catch (error) {
    console.error('Error in deactivateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/users/:id/activate
 * Replicates PHP activateUserProfileAction
 */
exports.activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = jsonDb.getTable('tbl_user') || [];
    const target = allUsers.find(u => String(u.id || u._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, message: 'User ID is missing. Please try again' });
    }

    const nowDay = new Date().toISOString().substring(0, 10);
    jsonDb.update('tbl_user', target._id || target.id, {
      status: '1',
      updated: nowDay
    });

    const userName = target.name || 'User';
    res.json({
      success: true,
      flag: true,
      message: `${userName} has been activated successfully.`
    });
  } catch (error) {
    console.error('Error in activateUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/users/:id/clear-device
 * Replicates PHP clearUserDeviceIdAction
 */
exports.clearUserDeviceId = async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = jsonDb.getTable('tbl_user') || [];
    const target = allUsers.find(u => String(u.id || u._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, title: 'User ID Missing!', message: 'Please try again after refreshing the page.' });
    }

    const nowDay = new Date().toISOString().substring(0, 10);
    jsonDb.update('tbl_user', target._id || target.id, {
      device_id: '',
      firebase_token: '',
      access_token: '',
      updated: nowDay
    });

    const userName = target.name || 'User';
    res.json({
      success: true,
      flag: true,
      title: 'Cleared Successfully',
      message: `${userName}'s device ID has been cleared successfully.`
    });
  } catch (error) {
    console.error('Error in clearUserDeviceId:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/users/:id
 * Replicates PHP deleteUserProfileAction (permanent soft deletion)
 */
exports.deleteUserPermanent = async (req, res) => {
  try {
    const { id } = req.params;
    const allUsers = jsonDb.getTable('tbl_user') || [];
    const target = allUsers.find(u => String(u.id || u._id) === String(id));

    if (!target) {
      return res.status(404).json({ success: false, message: 'User ID is missing. Please try again' });
    }

    const nowDay = new Date().toISOString().substring(0, 10);
    jsonDb.update('tbl_user', target._id || target.id, {
      status: '0',
      is_deleted: '1',
      updated: nowDay
    });

    const userName = target.name || 'User';
    res.json({
      success: true,
      flag: true,
      message: `${userName} has been deleted permanent successfully.`
    });
  } catch (error) {
    console.error('Error in deleteUserPermanent:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};