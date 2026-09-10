const mongoose = require('mongoose');
const {
  State,
  ClientMaster,
  CompanyVendor,
  masterModelMap
} = require('../models/masterData');

// Helper for title casing strings (PHP ucwords equivalent)
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ==========================================
// 1. STATE MASTER CONTROLLERS
// ==========================================

exports.getStates = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    if (req.query.active_only === 'true') {
      filter.is_active = true;
    }

    const states = await State.find(filter).sort({ state_name: 1 });
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch states', error: error.message });
  }
};

exports.getStateById = async (req, res) => {
  try {
    const { id } = req.params;
    const state = await State.findOne({ _id: id, is_deleted: { $ne: true } });
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    res.status(200).json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch state', error: error.message });
  }
};

exports.addState = async (req, res) => {
  try {
    const { state_name, state_code } = req.body;
    
    if (!state_name || state_name.trim() === "") {
      return res.status(400).json({ success: false, message: 'State Name Missing! Please enter state name.' });
    }
    if (!state_code || state_code.trim() === "") {
      return res.status(400).json({ success: false, message: 'State Code Missing! Please enter state code.' });
    }

    const formattedName = toTitleCase(state_name.trim());
    const formattedCode = state_code.trim();

    // Check duplicate state name or code
    const existing = await State.findOne({
      is_deleted: { $ne: true },
      $or: [
        { state_name: new RegExp(`^${formattedName}$`, 'i') },
        { state_code: formattedCode }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered state name or state code already exists.'
      });
    }

    const newState = new State({
      state_name: formattedName,
      state_code: formattedCode,
      is_active: true,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newState.save();
    res.status(201).json({ success: true, message: 'State name has been added successfully.', data: newState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name, state_code, is_active } = req.body;

    const updateData = {};
    if (state_name) updateData.state_name = toTitleCase(state_name.trim());
    if (state_code) updateData.state_code = state_code.trim();
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_by = req.user ? req.user.id : null;

    const updatedState = await State.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedState) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State Name has been updated successfully.', data: updatedState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update state', error: error.message });
  }
};

exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete to maintain relational integrity for existing sites & clients
    const state = await State.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_deleted: true, is_active: false, updated_by: req.user ? req.user.id : null },
      { new: true }
    );
    
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State has been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete state', error: error.message });
  }
};


// ==========================================
// 2. CLIENT MASTER CONTROLLERS
// ==========================================

exports.getClients = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    if (req.query.state_id) {
      filter.state_id = req.query.state_id;
    }
    if (req.query.active_only === 'true') {
      filter.is_active = true;
    }

    const clients = await ClientMaster.find(filter)
      .populate('state_id', 'state_name state_code')
      .sort({ client_name: 1 });

    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clients', error: error.message });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientMaster.findOne({ _id: id, is_deleted: { $ne: true } })
      .populate('state_id', 'state_name state_code');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch client details', error: error.message });
  }
};

exports.addClient = async (req, res) => {
  try {
    const {
      state_id,
      client_name,
      client_gst,
      client_billing_address,
      client_shipping_address,
      contact_number,
      client_contact_number,
      is_active
    } = req.body;

    if (!client_name || client_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Client Name Missing! Please enter client name.' });
    }
    if (!state_id) {
      return res.status(400).json({ success: false, message: 'State Name Missing! Please select state name.' });
    }
    if (!client_gst || client_gst.trim() === '') {
      return res.status(400).json({ success: false, message: 'GST Number Missing! Please enter client GST number.' });
    }
    if (!client_billing_address || client_billing_address.trim() === '') {
      return res.status(400).json({ success: false, message: 'Billing Address Missing! Please enter client billing address.' });
    }
    if (!client_shipping_address || client_shipping_address.trim() === '') {
      return res.status(400).json({ success: false, message: 'Shipping Address Missing! Please enter client shipping address.' });
    }

    // Verify valid state
    const stateExists = await State.findOne({ _id: state_id, is_deleted: { $ne: true } });
    if (!stateExists) {
      return res.status(400).json({ success: false, message: 'Invalid State selected.' });
    }

    // Check duplicate client name or GST
    const existing = await ClientMaster.findOne({
      is_deleted: { $ne: true },
      $or: [
        { client_name: client_name.trim().toUpperCase(), state_id },
        { client_gst: client_gst.trim().toUpperCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered client name in this state or GST number already exists.'
      });
    }

    const newClient = new ClientMaster({
      state_id,
      client_name: client_name.trim().toUpperCase(),
      client_gst: client_gst.trim().toUpperCase(),
      client_billing_address: client_billing_address.trim().toUpperCase(),
      client_shipping_address: client_shipping_address.trim().toUpperCase(),
      contact_number: (contact_number || client_contact_number || '').trim(),
      client_contact_number: (client_contact_number || contact_number || '').trim(),
      is_active: is_active !== undefined ? is_active : true,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newClient.save();
    const populated = await newClient.populate('state_id', 'state_name state_code');

    res.status(201).json({ success: true, message: 'Client name has been saved successfully.', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (body.client_name) body.client_name = body.client_name.trim().toUpperCase();
    if (body.client_gst) body.client_gst = body.client_gst.trim().toUpperCase();
    if (body.client_billing_address) body.client_billing_address = body.client_billing_address.trim().toUpperCase();
    if (body.client_shipping_address) body.client_shipping_address = body.client_shipping_address.trim().toUpperCase();
    if (body.contact_number && !body.client_contact_number) body.client_contact_number = body.contact_number;
    if (body.client_contact_number && !body.contact_number) body.contact_number = body.client_contact_number;
    body.updated_by = req.user ? req.user.id : null;

    const updatedClient = await ClientMaster.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      body,
      { new: true, runValidators: true }
    ).populate('state_id', 'state_name state_code');

    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({ success: true, message: 'Client updated successfully', data: updatedClient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete to protect relational links in po_sites & invoices
    const deletedClient = await ClientMaster.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_deleted: true, is_active: false, updated_by: req.user ? req.user.id : null },
      { new: true }
    );

    if (!deletedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({ success: true, message: 'Client has been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete client', error: error.message });
  }
};

exports.toggleClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const client = await ClientMaster.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_active: is_active === true, updated_by: req.user ? req.user.id : null },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const actionText = client.is_active ? 'activated' : 'deactivated';
    res.status(200).json({ success: true, message: `Client has been ${actionText} successfully.`, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client status', error: error.message });
  }
};


// ==========================================
// 3. COMPANY VENDOR CONTROLLERS
// ==========================================

exports.getCompanyVendors = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    if (req.query.active_only === 'true') {
      filter.is_active = true;
    }

    const vendors = await CompanyVendor.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch company vendors', error: error.message });
  }
};

exports.getCompanyVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await CompanyVendor.findOne({ _id: id, is_deleted: { $ne: true } });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Company vendor not found' });
    }
    res.status(200).json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendor', error: error.message });
  }
};

exports.addCompanyVendor = async (req, res) => {
  try {
    const {
      vendor_company_name,
      contact_person_name,
      contact_number,
      pan_number,
      gst_number,
      proprietor_name,
      company_address,
      is_active
    } = req.body;

    if (!vendor_company_name || vendor_company_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Company Name Missing! Please enter company name.' });
    }
    if (!contact_person_name || contact_person_name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Contact Person Missing! Please enter contact person name.' });
    }
    if (!contact_number || contact_number.trim() === '') {
      return res.status(400).json({ success: false, message: 'Contact Number Missing! Please enter contact Number.' });
    }
    if (!pan_number || pan_number.trim() === '') {
      return res.status(400).json({ success: false, message: 'PAN Number Missing! Please enter PAN number.' });
    }

    const formattedPan = pan_number.trim().toUpperCase();

    // Check duplicate PAN number
    const existing = await CompanyVendor.findOne({
      pan_number: formattedPan,
      is_deleted: { $ne: true }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered PAN number already exists.'
      });
    }

    const newVendor = new CompanyVendor({
      vendor_company_name: vendor_company_name.trim(),
      contact_person_name: contact_person_name.trim(),
      contact_number: contact_number.trim(),
      pan_number: formattedPan,
      gst_number: gst_number ? gst_number.trim().toUpperCase() : '',
      proprietor_name: proprietor_name ? proprietor_name.trim() : '',
      company_address: company_address ? company_address.trim() : '',
      is_active: is_active !== undefined ? is_active : true,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newVendor.save();
    res.status(201).json({ success: true, message: 'Company Vendor has been saved successfully.', data: newVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateCompanyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    if (body.pan_number) {
      body.pan_number = body.pan_number.trim().toUpperCase();
      const existing = await CompanyVendor.findOne({
        _id: { $ne: id },
        pan_number: body.pan_number,
        is_deleted: { $ne: true }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Entered PAN number already belongs to another vendor.' });
      }
    }

    if (body.gst_number) body.gst_number = body.gst_number.trim().toUpperCase();
    body.updated_by = req.user ? req.user.id : null;

    const updatedVendor = await CompanyVendor.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, message: 'Company Vendor updated successfully', data: updatedVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update vendor', error: error.message });
  }
};

exports.deleteCompanyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVendor = await CompanyVendor.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_deleted: true, is_active: false, updated_by: req.user ? req.user.id : null },
      { new: true }
    );

    if (!deletedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.status(200).json({ success: true, message: 'Company vendor has been deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete vendor', error: error.message });
  }
};

exports.toggleCompanyVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, is_active } = req.body;

    let targetActive = true;
    if (type === 'deactivate' || is_active === false) {
      targetActive = false;
    } else if (type === 'activate' || is_active === true) {
      targetActive = true;
    }

    const updated = await CompanyVendor.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_active: targetActive, updated_by: req.user ? req.user.id : null },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const statusText = targetActive ? 'activated' : 'deactivated';
    res.status(200).json({ success: true, message: `Company vendor has been ${statusText} successfully.`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};


// ==========================================
// 4. DYNAMIC CRUD CONTROLLER (FOR ALL MASTER DATA ENTITIES)
// ==========================================

const resolveMasterModel = (collectionName) => {
  const normalizedKey = (collectionName || '').toLowerCase().replace(/[-_]/g, '');
  if (masterModelMap[normalizedKey]) {
    return masterModelMap[normalizedKey];
  }
  if (masterModelMap[collectionName.toLowerCase()]) {
    return masterModelMap[collectionName.toLowerCase()];
  }
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  // Fallback dynamic schema with safety flags
  const schema = new mongoose.Schema({
    name: { type: String, trim: true },
    status: { type: Boolean, default: true },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false }
  }, { strict: false, timestamps: true, collection: collectionName });

  return mongoose.model(collectionName, schema);
};

exports.getDynamicList = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = resolveMasterModel(collection);
    
    // Always exclude soft-deleted items unless explicitly asked
    const filter = { is_deleted: { $ne: true } };
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: true }, { status: true }];
    }

    const data = await Model.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to fetch ${req.params.collection}`, error: error.message });
  }
};

exports.addDynamicItem = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = resolveMasterModel(collection);
    
    const bodyData = { ...req.body };
    if (bodyData._id) delete bodyData._id;
    bodyData.is_deleted = false;
    if (bodyData.is_active === undefined && bodyData.status !== undefined) {
      bodyData.is_active = bodyData.status;
    }
    
    const newItem = new Model(bodyData);
    await newItem.save();
    res.status(201).json({ success: true, message: `${collection} item added successfully`, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to add ${req.params.collection} item`, error: error.message });
  }
};

exports.updateDynamicItem = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = resolveMasterModel(collection);
    
    const bodyData = { ...req.body };
    if (bodyData._id) delete bodyData._id;
    if (bodyData.status !== undefined && bodyData.is_active === undefined) {
      bodyData.is_active = bodyData.status;
    }

    const updatedItem = await Model.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      bodyData,
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: `${collection} item updated successfully`, data: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to update ${req.params.collection} item`, error: error.message });
  }
};

exports.deleteDynamicItem = async (req, res) => {
  try {
    const { collection, id } = req.params;
    const Model = resolveMasterModel(collection);
    
    // Soft delete to protect related records
    const deletedItem = await Model.findOneAndUpdate(
      { _id: id, is_deleted: { $ne: true } },
      { is_deleted: true, is_active: false, status: false },
      { new: true }
    );

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, message: `${collection} item deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: `Failed to delete ${req.params.collection} item`, error: error.message });
  }
};
