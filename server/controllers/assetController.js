const jsonDb = require('../services/jsonDb');

/**
 * Get Init Data for Asset Management (dropdown masters, employees, categories, locations)
 */
exports.getAssetInitData = async (req, res) => {
  try {
    const rawTypes = jsonDb.getTable('asset_types') || [];
    const rawAssets = jsonDb.getTable('assets') || [];
    const rawUsers = jsonDb.getTable('tbl_user') || [];

    const activeTypes = rawTypes
      .filter(t => String(t.is_active) !== '2')
      .map(t => ({
        id: String(t.id || t._id),
        name: t.name || t.type,
        type: t.type || t.name,
        description: t.description || '',
        status: String(t.is_active) === '1' ? 'Active' : 'Inactive',
        is_active: String(t.is_active)
      }));

    const activeUsers = rawUsers
      .filter(u => String(u.is_deleted) !== '1' && String(u.status) !== '0')
      .map(u => ({
        id: String(u.id || u._id),
        name: u.name || u.user_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User ' + u.id,
        email: u.email_id || u.email || ''
      }));

    const availableAssets = rawAssets
      .filter(a => String(a.is_active) !== '2' && (a.status === 'Available' || !a.assigned_to))
      .map(a => ({
        id: String(a.id || a._id),
        code: a.code,
        name: a.name,
        asset_type_id: String(a.asset_type_id),
        condition: a.condition,
        location: a.location
      }));

    const conditions = ['New', 'Good', 'Fair', 'Needs Repair'];
    const statuses = ['Available', 'Assigned', 'In Maintenance', 'Archived'];
    const locations = [
      'Head Office Lucknow',
      'Head Office Floor 2',
      'IT Department Stockroom',
      'Central Warehouse',
      'Central Workshop',
      'Central QA Lab',
      'Regional Hub Lucknow',
      'Site IN-3627764 (Chhattisgarh)',
      'Site IN-3627765',
      'Site IN-3627766'
    ];

    res.json({
      success: true,
      data: {
        types: activeTypes,
        employees: activeUsers,
        availableAssets,
        conditions,
        statuses,
        locations
      }
    });
  } catch (error) {
    console.error('Error in getAssetInitData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ==========================================
 * ASSET TYPES CRUD
 * ==========================================
 */

exports.getAssetTypes = async (req, res) => {
  try {
    const rawTypes = jsonDb.getTable('asset_types') || [];
    const rawAssets = jsonDb.getTable('assets') || [];

    // Map active types with asset counts
    const types = rawTypes
      .filter(t => String(t.is_active) !== '2')
      .map(t => {
        const typeId = String(t.id || t._id);
        const count = rawAssets.filter(a => String(a.asset_type_id) === typeId && String(a.is_active) !== '2').length;
        return {
          id: typeId,
          _id: t._id || t.id,
          name: t.name || t.type,
          type: t.type || t.name,
          description: t.description || '',
          status: String(t.is_active) === '1' ? 'Active' : 'Inactive',
          is_active: String(t.is_active),
          assetCount: count
        };
      });

    res.json({ success: true, data: types, count: types.length });
  } catch (error) {
    console.error('Error in getAssetTypes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAssetType = async (req, res) => {
  try {
    const { name, type, description, status, is_active } = req.body;
    const typeName = (name || type || '').trim();

    if (!typeName) {
      return res.status(400).json({ success: false, message: 'Asset Type name is required' });
    }

    const rawTypes = jsonDb.getTable('asset_types') || [];
    const duplicate = rawTypes.find(t => 
      String(t.is_active) !== '2' && 
      (t.name || t.type || '').toLowerCase() === typeName.toLowerCase()
    );

    if (duplicate) {
      return res.status(400).json({ success: false, message: 'An Asset Type with this name already exists' });
    }

    const activeFlag = status === 'Inactive' || is_active === '0' || is_active === 0 ? '0' : '1';

    const newType = jsonDb.insert('asset_types', {
      type: typeName,
      name: typeName,
      description: description ? description.trim() : '',
      is_active: activeFlag
    });

    res.status(201).json({
      success: true,
      message: 'Asset Type created successfully',
      data: {
        id: String(newType.id || newType._id),
        ...newType,
        status: activeFlag === '1' ? 'Active' : 'Inactive',
        assetCount: 0
      }
    });
  } catch (error) {
    console.error('Error in createAssetType:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAssetType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description, status, is_active } = req.body;
    const typeName = (name || type || '').trim();

    const updates = {};
    if (typeName) {
      updates.type = typeName;
      updates.name = typeName;
    }
    if (description !== undefined) {
      updates.description = description.trim();
    }
    if (status !== undefined || is_active !== undefined) {
      updates.is_active = status === 'Inactive' || is_active === '0' || is_active === 0 ? '0' : '1';
    }

    const updated = jsonDb.update('asset_types', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Asset Type not found' });
    }

    res.json({
      success: true,
      message: 'Asset Type updated successfully',
      data: {
        id: String(updated.id || updated._id),
        ...updated,
        status: String(updated.is_active) === '1' ? 'Active' : 'Inactive'
      }
    });
  } catch (error) {
    console.error('Error in updateAssetType:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAssetType = async (req, res) => {
  try {
    const { id } = req.params;
    const rawAssets = jsonDb.getTable('assets') || [];

    // Check if any active asset uses this type
    const usedCount = rawAssets.filter(a => String(a.asset_type_id) === String(id) && String(a.is_active) !== '2').length;
    if (usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this Asset Type: it is currently linked to ${usedCount} asset(s). Please reassign or remove those assets first.`
      });
    }

    const updated = jsonDb.update('asset_types', id, { is_active: '2' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Asset Type not found' });
    }

    res.json({ success: true, message: 'Asset Type deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAssetType:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ==========================================
 * ASSETS INVENTORY CRUD
 * ==========================================
 */

exports.getAssets = async (req, res) => {
  try {
    const rawAssets = jsonDb.getTable('assets') || [];
    const rawTypes = jsonDb.getTable('asset_types') || [];
    const rawUsers = jsonDb.getTable('tbl_user') || [];
    const rawAssignments = jsonDb.getTable('tbl_asset_assignments') || [];

    const typeMap = new Map();
    rawTypes.forEach(t => typeMap.set(String(t.id || t._id), t.name || t.type));

    const userMap = new Map();
    rawUsers.forEach(u => userMap.set(String(u.id || u._id), u.name || u.user_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User ' + u.id));

    const activeAssets = rawAssets.filter(a => String(a.is_active) !== '2');

    const enriched = activeAssets.map(a => {
      const aId = String(a.id || a._id);
      const assignedUserId = a.assigned_to ? String(a.assigned_to) : null;
      const assignedUserName = assignedUserId ? (userMap.get(assignedUserId) || `User #${assignedUserId}`) : 'Unassigned';

      // Find active assignment if any
      const activeAssign = rawAssignments.find(asg => String(asg.asset_id) === aId && asg.status === 'Active');

      return {
        id: aId,
        _id: a._id || a.id,
        code: a.code || `AST-${String(a.id).padStart(3, '0')}`,
        name: a.name || 'Unnamed Asset',
        asset_type_id: String(a.asset_type_id || ''),
        typeName: typeMap.get(String(a.asset_type_id)) || 'General Asset',
        serial_number: a.serial_number || 'N/A',
        purchase_date: a.purchase_date || '',
        warranty_date: a.warranty_date || '',
        purchase_cost: a.purchase_cost || a.value || '0',
        value: a.value || a.purchase_cost || '0',
        condition: a.condition || 'Good',
        status: a.status || (assignedUserId ? 'Assigned' : 'Available'),
        location: a.location || 'Head Office',
        assigned_to: assignedUserId,
        assignedToName: assignedUserName,
        currentAssignmentId: activeAssign ? String(activeAssign.id || activeAssign._id) : null,
        notes: a.notes || '',
        is_active: String(a.is_active || '1')
      };
    });

    // Sort descending by id
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({ success: true, data: enriched, count: enriched.length });
  } catch (error) {
    console.error('Error in getAssets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const rawAssets = jsonDb.getTable('assets') || [];
    const rawTypes = jsonDb.getTable('asset_types') || [];
    const rawUsers = jsonDb.getTable('tbl_user') || [];
    const rawAssignments = jsonDb.getTable('tbl_asset_assignments') || [];

    const asset = rawAssets.find(a => String(a.id || a._id) === String(id) && String(a.is_active) !== '2');
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const type = rawTypes.find(t => String(t.id || t._id) === String(asset.asset_type_id));
    const assignedUser = asset.assigned_to ? rawUsers.find(u => String(u.id || u._id) === String(asset.assigned_to)) : null;

    // History of assignments
    const history = rawAssignments
      .filter(asg => String(asg.asset_id) === String(id))
      .map(asg => {
        const u = rawUsers.find(usr => String(usr.id || usr._id) === String(asg.assigned_to));
        return {
          id: String(asg.id || asg._id),
          assigned_to: asg.assigned_to,
          assignedToName: u ? (u.name || u.user_name) : `User #${asg.assigned_to}`,
          assign_date: asg.assign_date,
          return_date: asg.return_date,
          condition_on_assign: asg.condition_on_assign,
          condition_on_return: asg.condition_on_return,
          notes: asg.notes,
          status: asg.status
        };
      })
      .sort((a, b) => new Date(b.assign_date || 0) - new Date(a.assign_date || 0));

    res.json({
      success: true,
      data: {
        ...asset,
        id: String(asset.id || asset._id),
        typeName: type ? (type.name || type.type) : 'General',
        assignedToName: assignedUser ? (assignedUser.name || assignedUser.user_name) : 'Unassigned',
        history
      }
    });
  } catch (error) {
    console.error('Error in getAssetById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const {
      code,
      name,
      asset_type_id,
      serial_number,
      purchase_date,
      warranty_date,
      purchase_cost,
      value,
      condition,
      status,
      location,
      assigned_to,
      notes
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Asset Name is required' });
    }
    if (!asset_type_id) {
      return res.status(400).json({ success: false, message: 'Asset Type is required' });
    }

    const rawAssets = jsonDb.getTable('assets') || [];
    let assetCode = code ? code.trim() : '';

    if (!assetCode) {
      const nextNum = rawAssets.length + 1;
      assetCode = `AST-${String(nextNum).padStart(3, '0')}`;
    } else {
      const duplicate = rawAssets.find(a => String(a.is_active) !== '2' && a.code?.toLowerCase() === assetCode.toLowerCase());
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'An asset with this Code already exists' });
      }
    }

    const determinedStatus = assigned_to ? 'Assigned' : (status || 'Available');
    const assetVal = value || purchase_cost || '0';

    const newAsset = jsonDb.insert('assets', {
      code: assetCode,
      name: name.trim(),
      asset_type_id: String(asset_type_id),
      serial_number: serial_number ? serial_number.trim() : '',
      purchase_date: purchase_date || new Date().toISOString().substring(0, 10),
      warranty_date: warranty_date || '',
      purchase_cost: assetVal,
      value: assetVal,
      condition: condition || 'Good',
      status: determinedStatus,
      location: location ? location.trim() : 'Head Office',
      assigned_to: assigned_to ? String(assigned_to) : null,
      notes: notes ? notes.trim() : '',
      is_active: '1'
    });

    // If assigned to someone on creation, record assignment
    if (assigned_to) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      jsonDb.insert('tbl_asset_assignments', {
        asset_id: String(newAsset.id),
        assigned_to: String(assigned_to),
        assigned_by: String(req.user?.id || '1'),
        assign_date: now,
        return_date: null,
        condition_on_assign: condition || 'Good',
        condition_on_return: null,
        notes: notes || 'Assigned on asset creation.',
        status: 'Active'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: newAsset
    });
  } catch (error) {
    console.error('Error in createAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      asset_type_id,
      serial_number,
      purchase_date,
      warranty_date,
      purchase_cost,
      value,
      condition,
      status,
      location,
      notes
    } = req.body;

    const updates = {};
    if (code) updates.code = code.trim();
    if (name) updates.name = name.trim();
    if (asset_type_id) updates.asset_type_id = String(asset_type_id);
    if (serial_number !== undefined) updates.serial_number = serial_number.trim();
    if (purchase_date !== undefined) updates.purchase_date = purchase_date;
    if (warranty_date !== undefined) updates.warranty_date = warranty_date;
    if (purchase_cost !== undefined || value !== undefined) {
      updates.purchase_cost = value || purchase_cost;
      updates.value = value || purchase_cost;
    }
    if (condition) updates.condition = condition;
    if (status) updates.status = status;
    if (location !== undefined) updates.location = location.trim();
    if (notes !== undefined) updates.notes = notes.trim();

    const updated = jsonDb.update('assets', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error in updateAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = jsonDb.update('assets', id, { is_active: '2', status: 'Archived' });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    res.json({ success: true, message: 'Asset archived/deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ==========================================
 * ASSET ASSIGNMENTS, RETURNS & TRANSFERS
 * ==========================================
 */

exports.getAssignments = async (req, res) => {
  try {
    const rawAssignments = jsonDb.getTable('tbl_asset_assignments') || [];
    const rawAssets = jsonDb.getTable('assets') || [];
    const rawTypes = jsonDb.getTable('asset_types') || [];
    const rawUsers = jsonDb.getTable('tbl_user') || [];

    const assetMap = new Map();
    rawAssets.forEach(a => assetMap.set(String(a.id || a._id), a));

    const typeMap = new Map();
    rawTypes.forEach(t => typeMap.set(String(t.id || t._id), t.name || t.type));

    const userMap = new Map();
    rawUsers.forEach(u => userMap.set(String(u.id || u._id), u.name || u.user_name || [u.first_name, u.last_name].filter(Boolean).join(' ') || 'User ' + u.id));

    const enriched = rawAssignments.map(asg => {
      const asset = assetMap.get(String(asg.asset_id));
      const typeName = asset ? (typeMap.get(String(asset.asset_type_id)) || 'General Asset') : '-';
      const assignedToName = userMap.get(String(asg.assigned_to)) || `User #${asg.assigned_to}`;
      const assignedByName = asg.assigned_by ? (userMap.get(String(asg.assigned_by)) || 'Admin') : 'Admin';

      // Date formatting DD/MM/YYYY
      const formatDt = (dtStr) => {
        if (!dtStr) return '-';
        const dObj = new Date(dtStr);
        if (isNaN(dObj.getTime())) return dtStr.substring(0, 10);
        return `${String(dObj.getDate()).padStart(2, '0')}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${dObj.getFullYear()}`;
      };

      const formatTime = (dtStr) => {
        if (!dtStr) return '-';
        if (dtStr.includes(' ')) return dtStr.split(' ')[1]?.substring(0, 8) || '-';
        if (dtStr.includes('T')) return dtStr.split('T')[1]?.substring(0, 8) || '-';
        return '10:00:00';
      };

      return {
        id: String(asg.id || asg._id),
        _id: asg._id || asg.id,
        asset_id: String(asg.asset_id),
        assetCode: asset ? (asset.code || `AST-${asset.id}`) : 'Unknown',
        assetName: asset ? asset.name : 'Unknown Asset',
        assetType: typeName,
        assigned_to: String(asg.assigned_to),
        assignedToName,
        assigned_by: String(asg.assigned_by || '1'),
        assignedByName,
        assign_date: asg.assign_date || '',
        formattedAssignDate: formatDt(asg.assign_date),
        assignTime: formatTime(asg.assign_date),
        return_date: asg.return_date || null,
        formattedReturnDate: formatDt(asg.return_date),
        returnTime: formatTime(asg.return_date),
        condition_on_assign: asg.condition_on_assign || 'Good',
        condition_on_return: asg.condition_on_return || '-',
        notes: asg.notes || '',
        status: asg.status || (asg.return_date ? 'Returned' : 'Assigned')
      };
    });

    // Sort descending by id
    enriched.sort((a, b) => parseInt(b.id || 0, 10) - parseInt(a.id || 0, 10));

    res.json({ success: true, data: enriched, count: enriched.length });
  } catch (error) {
    console.error('Error in getAssignments:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignAsset = async (req, res) => {
  try {
    const rawAssets = jsonDb.getTable('assets') || [];

    // Support batch assignment matching PHP format (arrays of asset_id, assigned_to) or array of objects
    if (Array.isArray(req.body.assignments) || Array.isArray(req.body) || Array.isArray(req.body.asset_id)) {
      const items = Array.isArray(req.body.assignments)
        ? req.body.assignments
        : Array.isArray(req.body)
          ? req.body
          : req.body.asset_id.map((aId, idx) => ({
              asset_id: aId,
              assigned_to: Array.isArray(req.body.assigned_to) ? req.body.assigned_to[idx] : req.body.assigned_to,
              assign_date: req.body.assign_date
            }));

      const results = [];
      for (const item of items) {
        const chosenAssetId = String(item.asset_id || item.assetId || '');
        const chosenUserId = String(item.assigned_to || item.assignedTo || item.employee_id || '');
        const chosenDate = item.assign_date || new Date().toISOString().replace('T', ' ').substring(0, 19);

        if (!chosenAssetId || !chosenUserId) continue;

        const asset = rawAssets.find(a => String(a.id || a._id) === chosenAssetId);
        if (!asset) continue;

        const newAssignment = jsonDb.insert('tbl_asset_assignments', {
          asset_id: chosenAssetId,
          assigned_to: chosenUserId,
          assigned_by: String(req.user?.id || '1'),
          assign_date: chosenDate.includes(':') ? chosenDate : `${chosenDate} 10:00:00`,
          return_date: null,
          condition_on_assign: item.condition_on_assign || asset.condition || 'Good',
          condition_on_return: null,
          notes: item.notes ? item.notes.trim() : 'Assigned to employee',
          status: 'Active'
        });

        jsonDb.update('assets', chosenAssetId, {
          status: 'Assigned',
          assigned_to: chosenUserId,
          condition: item.condition_on_assign || asset.condition || 'Good'
        });

        results.push(newAssignment);
      }

      return res.status(201).json({
        success: true,
        message: 'Assets assigned successfully',
        data: results
      });
    }

    const {
      asset_id,
      assetId,
      assigned_to,
      assignedTo,
      employee_id,
      assign_date,
      condition_on_assign,
      notes
    } = req.body;

    const chosenAssetId = String(asset_id || assetId || '');
    const chosenUserId = String(assigned_to || assignedTo || employee_id || '');
    const chosenDate = assign_date || new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (!chosenAssetId) {
      return res.status(400).json({ success: false, message: 'Please select an asset to assign' });
    }
    if (!chosenUserId) {
      return res.status(400).json({ success: false, message: 'Please select an employee' });
    }

    const asset = rawAssets.find(a => String(a.id || a._id) === chosenAssetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    if (asset.status === 'Assigned' && asset.assigned_to) {
      return res.status(400).json({ success: false, message: 'This asset is already assigned to an employee. Please return or transfer it first.' });
    }

    // Insert new assignment
    const newAssignment = jsonDb.insert('tbl_asset_assignments', {
      asset_id: chosenAssetId,
      assigned_to: chosenUserId,
      assigned_by: String(req.user?.id || '1'),
      assign_date: chosenDate.includes(':') ? chosenDate : `${chosenDate} 10:00:00`,
      return_date: null,
      condition_on_assign: condition_on_assign || asset.condition || 'Good',
      condition_on_return: null,
      notes: notes ? notes.trim() : 'Assigned to employee',
      status: 'Active'
    });

    // Update asset status
    jsonDb.update('assets', chosenAssetId, {
      status: 'Assigned',
      assigned_to: chosenUserId,
      condition: condition_on_assign || asset.condition || 'Good'
    });

    res.status(201).json({
      success: true,
      message: 'Asset assigned successfully',
      data: newAssignment
    });
  } catch (error) {
    console.error('Error in assignAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.returnAsset = async (req, res) => {
  try {
    const {
      assignment_id,
      assignmentId,
      id,
      asset_id,
      assetId,
      return_date,
      returnDate,
      condition_on_return,
      condition,
      notes
    } = req.body;

    const rawAssignments = jsonDb.getTable('tbl_asset_assignments') || [];
    let asg = null;

    const targetId = String(assignment_id || assignmentId || id || req.params.id || '');
    if (targetId) {
      asg = rawAssignments.find(a => String(a.id || a._id) === targetId);
    }
    if (!asg && (asset_id || assetId)) {
      const astId = String(asset_id || assetId);
      asg = rawAssignments.find(a => String(a.asset_id) === astId && a.status === 'Active');
    }

    if (!asg) {
      return res.status(404).json({ success: false, message: 'Active assignment record not found' });
    }

    const chosenReturnDate = return_date || returnDate || new Date().toISOString().replace('T', ' ').substring(0, 19);
    const returnCondition = condition_on_return || condition || 'Good';
    const finalAssetStatus = (returnCondition === 'Needs Repair' || returnCondition === 'Damaged') ? 'In Maintenance' : 'Available';

    // Update assignment record
    jsonDb.update('tbl_asset_assignments', asg.id, {
      return_date: chosenReturnDate.includes(':') ? chosenReturnDate : `${chosenReturnDate} 17:00:00`,
      condition_on_return: returnCondition,
      notes: notes ? `${asg.notes || ''} [Returned: ${notes.trim()}]` : asg.notes,
      status: 'Returned'
    });

    // Update asset record
    jsonDb.update('assets', asg.asset_id, {
      status: finalAssetStatus,
      assigned_to: null,
      condition: returnCondition
    });

    res.json({
      success: true,
      message: `Asset returned successfully and marked as ${finalAssetStatus}`
    });
  } catch (error) {
    console.error('Error in returnAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transferAsset = async (req, res) => {
  try {
    const {
      assignment_id,
      assignmentId,
      asset_id,
      assetId,
      to_employee_id,
      toEmployeeId,
      new_employee_id,
      target_employee_id,
      transfer_date,
      transferDate,
      notes
    } = req.body;

    const newUserId = String(to_employee_id || toEmployeeId || new_employee_id || target_employee_id || '');
    if (!newUserId) {
      return res.status(400).json({ success: false, message: 'Please select the employee to transfer asset to' });
    }

    const rawAssignments = jsonDb.getTable('tbl_asset_assignments') || [];
    let currentAsg = null;

    if (assignment_id || assignmentId) {
      const aId = String(assignment_id || assignmentId);
      currentAsg = rawAssignments.find(a => String(a.id || a._id) === aId);
    } else if (asset_id || assetId) {
      const astId = String(asset_id || assetId);
      currentAsg = rawAssignments.find(a => String(a.asset_id) === astId && a.status === 'Active');
    }

    if (!currentAsg) {
      return res.status(404).json({ success: false, message: 'Active assignment record not found for transfer' });
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateOfTransfer = transfer_date || transferDate || now;

    // 1. Mark previous assignment as Transferred
    jsonDb.update('tbl_asset_assignments', currentAsg.id, {
      return_date: dateOfTransfer.includes(':') ? dateOfTransfer : `${dateOfTransfer} 12:00:00`,
      condition_on_return: currentAsg.condition_on_assign || 'Good',
      notes: `${currentAsg.notes || ''} [Transferred to User #${newUserId}: ${notes || ''}]`.trim(),
      status: 'Transferred'
    });

    // 2. Create new active assignment for target employee
    const newAssignment = jsonDb.insert('tbl_asset_assignments', {
      asset_id: String(currentAsg.asset_id),
      assigned_to: newUserId,
      assigned_by: String(req.user?.id || '1'),
      assign_date: dateOfTransfer.includes(':') ? dateOfTransfer : `${dateOfTransfer} 12:00:00`,
      return_date: null,
      condition_on_assign: currentAsg.condition_on_assign || 'Good',
      condition_on_return: null,
      notes: `Transferred from User #${currentAsg.assigned_to}. ${notes || ''}`.trim(),
      status: 'Active'
    });

    // 3. Update asset assigned_to
    jsonDb.update('assets', currentAsg.asset_id, {
      status: 'Assigned',
      assigned_to: newUserId
    });

    res.json({
      success: true,
      message: 'Asset transferred successfully',
      data: newAssignment
    });
  } catch (error) {
    console.error('Error in transferAsset:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};