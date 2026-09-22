const { createJsonModel } = require('../models/JsonModel');
const jsonDb = require('../services/jsonDb');
const {
  State,
  ClientMaster,
  CompanyVendor,
  DebitAccount,
  Role,
  RoleType,
  ExpenseType,
  ExpenseIn,
  ExpenseFor,
  WorkForSiteOf,
  NatureOfWork,
  SiteType,
  WorkMaster,
  WorkDescription,
  VendorExperience,
  OrganizationType,
  AssociationYears,
  GeographicalPresence,
  MajorClients,
  TeamStrength,
  AnnualTurnover,
  WorkHandleAmount,
  ProductSupplier,
  ProductList,
  ProductType,
  ProductUnit,
  ProductBrand,
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
// 2. CLIENT MASTER CONTROLLERS (PHP MasterController replica)
// ==========================================

const getStateLookupMap = async () => {
  const allStates = await State.find({ is_deleted: { $ne: true } });
  const map = {};
  (allStates || []).forEach(s => {
    const doc = s.toObject ? s.toObject() : s;
    if (doc.id !== undefined && doc.id !== null) map[String(doc.id)] = doc;
    if (doc._id) map[String(doc._id)] = doc;
  });
  return map;
};

const enrichClientWithState = (clientDoc, stateMap) => {
  if (!clientDoc) return null;
  const doc = clientDoc.toObject ? clientDoc.toObject() : { ...clientDoc };
  const rawStateId = String(doc.state_id || '');
  const matchedState = stateMap[rawStateId] || null;
  const stateName = matchedState ? matchedState.state_name : '';
  const stateCode = matchedState ? (matchedState.state_code || '') : '';

  return {
    ...doc,
    state_name: stateName,
    state_id: matchedState ? {
      _id: matchedState._id,
      id: matchedState.id || matchedState._id,
      state_name: stateName,
      state_code: stateCode
    } : (doc.state_id || null),
    raw_state_id: rawStateId,
    contact_number: doc.contact_number || doc.client_contact_number || '',
    client_contact_number: doc.client_contact_number || doc.contact_number || '',
    is_active: doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true
  };
};

exports.getClients = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    if (req.query.state_id) {
      filter.state_id = String(req.query.state_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: true }, { is_active: 1 }, { is_active: '1' }];
    }

    const rawClients = await ClientMaster.find(filter).sort({ client_name: 1 });
    const stateMap = await getStateLookupMap();

    const clients = (rawClients || []).map(c => enrichClientWithState(c, stateMap));

    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clients', error: error.message });
  }
};

exports.getClientDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await ClientMaster.findOne({
      $or: [{ _id: id }, { id: String(id) }],
      is_deleted: { $ne: true }
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const stateMap = await getStateLookupMap();
    const formatted = enrichClientWithState(client, stateMap);

    res.status(200).json({ success: true, data: formatted });
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

    // Verify valid state by id or _id
    const stateExists = await State.findOne({
      $or: [{ _id: state_id }, { id: String(state_id) }],
      is_deleted: { $ne: true }
    });
    if (!stateExists) {
      return res.status(400).json({ success: false, message: 'Invalid State selected.' });
    }

    const normalizedStateId = String(stateExists.id || stateExists._id);

    // Check duplicate client name or GST
    const existing = await ClientMaster.findOne({
      is_deleted: { $ne: true },
      $or: [
        { client_name: client_name.trim().toUpperCase(), state_id: normalizedStateId },
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
      state_id: normalizedStateId,
      client_name: client_name.trim().toUpperCase(),
      client_gst: client_gst.trim().toUpperCase(),
      client_billing_address: client_billing_address.trim().toUpperCase(),
      client_shipping_address: client_shipping_address.trim().toUpperCase(),
      contact_number: (contact_number || client_contact_number || '').trim(),
      client_contact_number: (client_contact_number || contact_number || '').trim(),
      is_active: is_active !== undefined ? (is_active === true || is_active === '1' || is_active === 1 ? '1' : '0') : '1',
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newClient.save();
    const stateMap = await getStateLookupMap();
    const populated = enrichClientWithState(newClient, stateMap);

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
    if (body.state_id) {
      const stateDoc = await State.findOne({
        $or: [{ _id: body.state_id }, { id: String(body.state_id) }],
        is_deleted: { $ne: true }
      });
      if (stateDoc) {
        body.state_id = String(stateDoc.id || stateDoc._id);
      }
    }
    if (body.is_active !== undefined) {
      body.is_active = (body.is_active === true || body.is_active === '1' || body.is_active === 1) ? '1' : '0';
    }
    body.updated_by = req.user ? req.user.id : null;

    const updatedClient = await ClientMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: String(id) }], is_deleted: { $ne: true } },
      body,
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const stateMap = await getStateLookupMap();
    const populated = enrichClientWithState(updatedClient, stateMap);

    res.status(200).json({ success: true, message: 'Client updated successfully', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update client', error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    // Soft delete to protect relational links in po_sites & invoices
    const deletedClient = await ClientMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: String(id) }], is_deleted: { $ne: true } },
      { is_deleted: true, is_active: '0', updated_by: req.user ? req.user.id : null },
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
    const targetActive = (is_active === true || is_active === '1' || is_active === 1);

    const client = await ClientMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: String(id) }], is_deleted: { $ne: true } },
      { is_active: targetActive ? '1' : '0', updated_by: req.user ? req.user.id : null },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const actionText = (client.is_active === '1' || client.is_active === true) ? 'activated' : 'deactivated';
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
// 4. DEBIT ACCOUNT CONTROLLERS (PHP MasterController replica)
// ==========================================

exports.getDebitAccounts = async (req, res) => {
  try {
    const filter = { is_deleted: { $ne: true } };
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: true }, { is_active: 1 }, { is_active: '1' }, { status: true }];
    }

    const accounts = await DebitAccount.find(filter);
    
    const formatted = (accounts || []).map(acc => {
      const doc = acc.toObject ? acc.toObject() : { ...acc };
      const isActive = doc.is_active === true || doc.is_active === 1 || doc.is_active === '1' || doc.status === true;
      return {
        ...doc,
        debit_account: doc.debit_account || doc.name || '',
        name: doc.debit_account || doc.name || '',
        is_active: isActive,
        status: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch debit accounts', error: error.message });
  }
};

exports.getDebitAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await DebitAccount.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true }
    });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Debit account not found' });
    }
    const doc = account.toObject ? account.toObject() : { ...account };
    const isActive = doc.is_active === true || doc.is_active === 1 || doc.is_active === '1' || doc.status === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        debit_account: doc.debit_account || doc.name || '',
        name: doc.debit_account || doc.name || '',
        is_active: isActive,
        status: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch debit account', error: error.message });
  }
};

exports.addDebitAccount = async (req, res) => {
  try {
    const rawName = req.body.debit_account || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter the debit_account'
      });
    }

    const debitAccountName = rawName.trim();

    // Check duplicate (case-insensitive) - matching PHP checkDuplicateData
    const existing = await DebitAccount.findOne({
      is_deleted: { $ne: true },
      $or: [
        { debit_account: new RegExp(`^${debitAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { name: new RegExp(`^${debitAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered Debit Account already exists.'
      });
    }

    const isActive = req.body.is_active !== undefined 
      ? (req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1')
      : (req.body.status !== undefined ? (req.body.status === true || req.body.status === '1') : true);

    const newAccount = new DebitAccount({
      debit_account: debitAccountName,
      name: debitAccountName,
      is_active: isActive ? '1' : '0',
      status: isActive,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newAccount.save();
    res.status(201).json({
      success: true,
      message: 'Debit Account has been added successfully.',
      data: newAccount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateDebitAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body.debit_account || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter the debit_account'
      });
    }

    const debitAccountName = rawName.trim();

    // Check duplicate for other records
    const existing = await DebitAccount.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      $or: [
        { debit_account: new RegExp(`^${debitAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { name: new RegExp(`^${debitAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Data Found! Entered Debit Account already exists.'
      });
    }

    const isActive = req.body.is_active !== undefined 
      ? (req.body.is_active === true || req.body.is_active === 1 || req.body.is_active === '1')
      : (req.body.status !== undefined ? (req.body.status === true || req.body.status === '1') : true);

    const updated = await DebitAccount.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true } },
      {
        debit_account: debitAccountName,
        name: debitAccountName,
        is_active: isActive ? '1' : '0',
        status: isActive,
        updated_by: req.user ? req.user.id : null
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Debit account not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Debit Account has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.deleteDebitAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DebitAccount.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true } },
      { is_deleted: true, is_active: '0', status: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Debit Account ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Debit Account has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 5. ROLE TYPES CONTROLLERS (PHP MasterController replica)
// ==========================================

exports.getRoleTypes = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { status: true }, { is_active: true }];
    }

    const types = await RoleType.find(filter);
    const formatted = (types || []).map(t => {
      const doc = t.toObject ? t.toObject() : { ...t };
      const isActive = doc.status === '1' || doc.status === 1 || doc.status === true;
      return {
        ...doc,
        role_type: doc.role_type || doc.name || '',
        name: doc.role_type || doc.name || '',
        status: isActive,
        is_active: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch role types', error: error.message });
  }
};

exports.getRoleTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await RoleType.findOne({
      $or: [{ _id: id }, { id: id }],
      status: { $nin: ['2', 2] },
      is_deleted: { $ne: true }
    });
    if (!type) {
      return res.status(404).json({ success: false, message: 'Role type not found' });
    }
    const doc = type.toObject ? type.toObject() : { ...type };
    const isActive = doc.status === '1' || doc.status === 1 || doc.status === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        role_type: doc.role_type || doc.name || '',
        name: doc.role_type || doc.name || '',
        status: isActive,
        is_active: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch role type', error: error.message });
  }
};

exports.addRoleType = async (req, res) => {
  try {
    const rawType = req.body.role_type || req.body.name;
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter role type.' });
    }

    const formattedRoleType = toTitleCase(rawType.trim());

    // Duplicate check matching PHP
    const existing = await RoleType.findOne({
      status: { $nin: ['2', 2] },
      is_deleted: { $ne: true },
      role_type: new RegExp(`^${formattedRoleType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered Role Type already exists.' });
    }

    const isActive = req.body.status !== undefined 
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const newRoleType = new RoleType({
      role_type: formattedRoleType,
      status: isActive ? '1' : '0',
      is_active: isActive,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newRoleType.save();
    res.status(201).json({
      success: true,
      message: 'Role Type has been saved successfully.',
      data: newRoleType
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateRoleType = async (req, res) => {
  try {
    const { id } = req.params;
    const rawType = req.body.role_type || req.body.name;
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter role type.' });
    }

    const formattedRoleType = toTitleCase(rawType.trim());

    const existing = await RoleType.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      status: { $nin: ['2', 2] },
      is_deleted: { $ne: true },
      role_type: new RegExp(`^${formattedRoleType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered Role Type already exists.' });
    }

    const isActive = req.body.status !== undefined 
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const updated = await RoleType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], status: { $nin: ['2', 2] }, is_deleted: { $ne: true } },
      {
        role_type: formattedRoleType,
        status: isActive ? '1' : '0',
        is_active: isActive,
        updated_by: req.user ? req.user.id : null
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role type not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Role Type has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.toggleRoleTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Role Type has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Role Type has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Role Type has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Role Type has been activated successfully.';
    }

    const updateFields = {
      status: targetStatus,
      is_active: targetStatus === '1'
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await RoleType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role Type ID is missing or not found. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRoleType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RoleType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Role Type ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Role Type has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 6. EMPLOYEE ROLES CONTROLLERS (PHP MasterController replica)
// ==========================================

exports.getRoles = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { status: true }, { is_active: true }];
    }

    const roles = await Role.find(filter);

    // Fetch all role types to join role_type_name (replicating PHP joinLeft tbl_role_type)
    const allRoleTypes = await RoleType.find({});
    const roleTypeMap = {};
    (allRoleTypes || []).forEach(rt => {
      const doc = rt.toObject ? rt.toObject() : rt;
      if (doc.id) roleTypeMap[String(doc.id)] = doc.role_type;
      if (doc._id) roleTypeMap[String(doc._id)] = doc.role_type;
    });

    const formatted = (roles || []).map(r => {
      const doc = r.toObject ? r.toObject() : { ...r };
      const isActive = doc.status === '1' || doc.status === 1 || doc.status === true;
      const typeId = String(doc.role_type || doc.role_type_id || '');
      const typeName = roleTypeMap[typeId] || doc.role_type_name || '';
      return {
        ...doc,
        role: doc.role || doc.name || '',
        name: doc.role || doc.name || '',
        role_type: typeId,
        role_type_name: typeName,
        status: isActive,
        is_active: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch roles', error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({
      $or: [{ _id: id }, { id: id }],
      status: { $nin: ['2', 2] },
      is_deleted: { $ne: true }
    });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    const doc = role.toObject ? role.toObject() : { ...role };
    const isActive = doc.status === '1' || doc.status === 1 || doc.status === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        role: doc.role || doc.name || '',
        name: doc.role || doc.name || '',
        status: isActive,
        is_active: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch role', error: error.message });
  }
};

exports.addRole = async (req, res) => {
  try {
    const rawRole = req.body.role || req.body.name;
    const roleType = req.body.role_type || req.body.role_type_id;

    if (!rawRole || rawRole.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter role name.' });
    }
    if (!roleType) {
      return res.status(400).json({ success: false, message: 'Please select role type.' });
    }

    const roleName = rawRole.trim();

    // Check duplicate role in same role_type
    const existing = await Role.findOne({
      status: { $nin: ['2', 2] },
      is_deleted: { $ne: true },
      role_type: String(roleType),
      role: new RegExp(`^${roleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered Role already exists for this Role Type.' });
    }

    const isActive = req.body.status !== undefined 
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const newRole = new Role({
      role: roleName,
      role_type: String(roleType),
      status: isActive ? '1' : '0',
      is_active: isActive,
      is_deleted: false,
      created_by: req.user ? req.user.id : null
    });

    await newRole.save();
    res.status(201).json({
      success: true,
      message: 'Employee Role Name has been saved successfully.',
      data: newRole
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const rawRole = req.body.role || req.body.name;
    const roleType = req.body.role_type || req.body.role_type_id;

    if (!rawRole || rawRole.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please enter role name.' });
    }

    const roleName = rawRole.trim();

    if (roleType) {
      const existing = await Role.findOne({
        _id: { $ne: id },
        id: { $ne: id },
        status: { $nin: ['2', 2] },
        is_deleted: { $ne: true },
        role_type: String(roleType),
        role: new RegExp(`^${roleName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Duplicate Data Found! Entered Role already exists for this Role Type.' });
      }
    }

    const isActive = req.body.status !== undefined 
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const updatePayload = {
      role: roleName,
      status: isActive ? '1' : '0',
      is_active: isActive,
      updated_by: req.user ? req.user.id : null
    };
    if (roleType) updatePayload.role_type = String(roleType);

    const updated = await Role.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], status: { $nin: ['2', 2] }, is_deleted: { $ne: true } },
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee Role Name has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};

exports.toggleRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Role has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Role has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Role has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Role has been activated successfully.';
    }

    const updateFields = {
      status: targetStatus,
      is_active: targetStatus === '1'
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await Role.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Role ID is missing or not found. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Role.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Role ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Role has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 7. EXPENSE TYPE MASTER CONTROLLERS (PHP tbl_expense_type_master)
// ==========================================

exports.getExpenseTypes = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { is_active: true }];
    }

    const expenseTypes = await ExpenseType.find(filter).sort({ expense_type: 1 });
    const formatted = (expenseTypes || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
      return {
        ...doc,
        id: doc.id || doc._id,
        expense_type: doc.expense_type || doc.name || '',
        name: doc.expense_type || doc.name || '',
        status: isActive ? '1' : '0',
        is_active: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expense types', error: error.message });
  }
};

exports.getExpenseTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExpenseType.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Expense Type not found' });
    }
    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        expense_type: doc.expense_type || doc.name || '',
        name: doc.expense_type || doc.name || '',
        status: isActive ? '1' : '0',
        is_active: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expense type', error: error.message });
  }
};

exports.addExpenseType = async (req, res) => {
  try {
    const rawType = req.body.expense_type || req.body.expenseType || req.body.name;
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please enter expense type.' });
    }

    const typeName = rawType.trim();

    // Check duplicate expense type
    const existing = await ExpenseType.findOne({
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_type: new RegExp(`^${typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense Type already exists.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const newItem = new ExpenseType({
      expense_type: typeName,
      name: typeName,
      status: isActive ? '1' : '0',
      is_active: isActive,
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      message: 'Expense type has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateExpenseType = async (req, res) => {
  try {
    const { id } = req.params;
    const rawType = req.body.expense_type || req.body.expenseType || req.body.name;
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please enter expense type.' });
    }

    const typeName = rawType.trim();

    // Duplicate check
    const existing = await ExpenseType.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_type: new RegExp(`^${typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense Type already exists.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const updated = await ExpenseType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, status: { $nin: ['2', 2] } },
      {
        expense_type: typeName,
        name: typeName,
        status: isActive ? '1' : '0',
        is_active: isActive,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense Type not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense type has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleExpenseTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Expense Type has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Expense Type has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Expense Type has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Expense Type has been activated successfully.';
    }

    const updateFields = {
      status: targetStatus,
      is_active: targetStatus === '1',
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await ExpenseType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense Type ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteExpenseType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExpenseType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense Type ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense Type has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 8. EXPENSE IN MASTER CONTROLLERS (PHP tbl_expense_in_type_master)
// ==========================================

exports.getExpenseIns = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.expense_type_id) {
      filter.expense_type_id = String(req.query.expense_type_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { is_active: true }];
    }

    const expenseIns = await ExpenseIn.find(filter).sort({ expense_in_type: 1 });

    // Build lookup for expense types
    const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
      if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
    });

    const formatted = (expenseIns || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
      const typeName = typeMap[String(doc.expense_type_id)] || doc.expense_type_name || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        expense_in_type: doc.expense_in_type || doc.name || '',
        name: doc.expense_in_type || doc.name || '',
        expense_type: typeName,
        expense_type_name: typeName,
        expense_type_id: String(doc.expense_type_id || ''),
        status: isActive ? '1' : '0',
        is_active: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expense in items', error: error.message });
  }
};

exports.getExpenseInById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExpenseIn.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Expense In item not found' });
    }

    const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
      if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        expense_in_type: doc.expense_in_type || doc.name || '',
        name: doc.expense_in_type || doc.name || '',
        expense_type_name: typeMap[String(doc.expense_type_id)] || '',
        status: isActive ? '1' : '0',
        is_active: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addExpenseIn = async (req, res) => {
  try {
    const expenseTypeId = req.body.expense_type_id || req.body.expenseTypeId;
    const rawName = req.body.expense_in_type || req.body.expenseInType || req.body.name;

    if (!expenseTypeId || String(expenseTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please enter expense type.' });
    }
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense In Type Missing! Please enter expense in type.' });
    }

    const expenseInName = rawName.trim();

    // Check duplicate within same expense type
    const existing = await ExpenseIn.findOne({
      expense_type_id: String(expenseTypeId),
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_in_type: new RegExp(`^${expenseInName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense In Type already exists for this Expense Type.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const newItem = new ExpenseIn({
      expense_type_id: String(expenseTypeId),
      expense_in_type: expenseInName,
      name: expenseInName,
      status: isActive ? '1' : '0',
      is_active: isActive,
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      message: 'Expense in type has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateExpenseIn = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseTypeId = req.body.expense_type_id || req.body.expenseTypeId;
    const rawName = req.body.expense_in_type || req.body.expenseInType || req.body.name;

    if (!expenseTypeId || String(expenseTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please enter expense type.' });
    }
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense In Type Missing! Please enter expense in type.' });
    }

    const expenseInName = rawName.trim();

    // Check duplicate
    const existing = await ExpenseIn.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      expense_type_id: String(expenseTypeId),
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_in_type: new RegExp(`^${expenseInName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense In Type already exists for this Expense Type.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const updated = await ExpenseIn.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, status: { $nin: ['2', 2] } },
      {
        expense_type_id: String(expenseTypeId),
        expense_in_type: expenseInName,
        name: expenseInName,
        status: isActive ? '1' : '0',
        is_active: isActive,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense In item not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense in type has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleExpenseInStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Expense In Type has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Expense In Type has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Expense In Type has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Expense In Type has been activated successfully.';
    }

    const updateFields = {
      status: targetStatus,
      is_active: targetStatus === '1',
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await ExpenseIn.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense In ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteExpenseIn = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExpenseIn.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense In ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense In Type has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 9. EXPENSE FOR MASTER CONTROLLERS (PHP tbl_expense_transfer_for_master)
// ==========================================

exports.getExpenseFors = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.expense_type_id) {
      filter.expense_type_id = String(req.query.expense_type_id);
    }
    if (req.query.expense_in_id) {
      filter.expense_in_id = String(req.query.expense_in_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { is_active: true }];
    }

    const expenseFors = await ExpenseFor.find(filter).sort({ expense_transfer_for: 1 });

    // Lookups
    const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
      if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
    });

    const allIns = jsonDb.find('tbl_expense_in_type_master', {}) || [];
    const inMap = {};
    allIns.forEach(i => {
      if (i.id) inMap[String(i.id)] = i.expense_in_type || i.name;
      if (i._id) inMap[String(i._id)] = i.expense_in_type || i.name;
    });

    const formatted = (expenseFors || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
      const typeName = typeMap[String(doc.expense_type_id)] || doc.expense_type_name || '';
      const inName = inMap[String(doc.expense_in_id)] || doc.expense_in_name || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        expense_transfer_for: doc.expense_transfer_for || doc.name || '',
        name: doc.expense_transfer_for || doc.name || '',
        expense_type: typeName,
        expense_type_name: typeName,
        expense_type_id: String(doc.expense_type_id || ''),
        expense_in_type: inName,
        expense_in_name: inName,
        expense_in_id: String(doc.expense_in_id || ''),
        status: isActive ? '1' : '0',
        is_active: isActive
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expense for items', error: error.message });
  }
};

exports.getExpenseForById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ExpenseFor.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Expense For item not found' });
    }

    const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
      if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
    });

    const allIns = jsonDb.find('tbl_expense_in_type_master', {}) || [];
    const inMap = {};
    allIns.forEach(i => {
      if (i.id) inMap[String(i.id)] = i.expense_in_type || i.name;
      if (i._id) inMap[String(i._id)] = i.expense_in_type || i.name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        expense_transfer_for: doc.expense_transfer_for || doc.name || '',
        name: doc.expense_transfer_for || doc.name || '',
        expense_type_name: typeMap[String(doc.expense_type_id)] || '',
        expense_in_name: inMap[String(doc.expense_in_id)] || '',
        status: isActive ? '1' : '0',
        is_active: isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addExpenseFor = async (req, res) => {
  try {
    const expenseTypeId = req.body.expense_type_id || req.body.expenseTypeId;
    const expenseInId = req.body.expense_in_id || req.body.expenseInId;
    const rawFor = req.body.expense_transfer_for || req.body.expenseTransferFor || req.body.expenseFor || req.body.name;

    if (!expenseTypeId || String(expenseTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please select expense type.' });
    }
    if (!expenseInId || String(expenseInId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense In Missing! Please select expense in.' });
    }
    if (!rawFor || rawFor.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense For Missing! Please enter expense for.' });
    }

    const expenseTransferFor = rawFor.trim();

    // Check duplicate
    const existing = await ExpenseFor.findOne({
      expense_type_id: String(expenseTypeId),
      expense_in_id: String(expenseInId),
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_transfer_for: new RegExp(`^${expenseTransferFor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense For already exists for this selection.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const newItem = new ExpenseFor({
      expense_type_id: String(expenseTypeId),
      expense_in_id: String(expenseInId),
      expense_transfer_for: expenseTransferFor,
      name: expenseTransferFor,
      status: isActive ? '1' : '0',
      is_active: isActive,
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      message: 'Expense Transfer For saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateExpenseFor = async (req, res) => {
  try {
    const { id } = req.params;
    const expenseTypeId = req.body.expense_type_id || req.body.expenseTypeId;
    const expenseInId = req.body.expense_in_id || req.body.expenseInId;
    const rawFor = req.body.expense_transfer_for || req.body.expenseTransferFor || req.body.expenseFor || req.body.name;

    if (!expenseTypeId || String(expenseTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Type Missing! Please select expense type.' });
    }
    if (!expenseInId || String(expenseInId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense In Missing! Please select expense in.' });
    }
    if (!rawFor || rawFor.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Expense Transfer For Missing! Please enter expense transfer for.' });
    }

    const expenseTransferFor = rawFor.trim();

    // Check duplicate
    const existing = await ExpenseFor.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      expense_type_id: String(expenseTypeId),
      expense_in_id: String(expenseInId),
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      expense_transfer_for: new RegExp(`^${expenseTransferFor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered Expense For already exists for this selection.'
      });
    }

    const isActive = req.body.status !== undefined
      ? (req.body.status === true || req.body.status === 1 || req.body.status === '1')
      : true;

    const updated = await ExpenseFor.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, status: { $nin: ['2', 2] } },
      {
        expense_type_id: String(expenseTypeId),
        expense_in_id: String(expenseInId),
        expense_transfer_for: expenseTransferFor,
        name: expenseTransferFor,
        status: isActive ? '1' : '0',
        is_active: isActive,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense For item not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense Transfer For has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleExpenseForStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Expense Transfer For has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Expense Transfer For has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Expense Transfer For has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Expense Transfer For has been activated successfully.';
    }

    const updateFields = {
      status: targetStatus,
      is_active: targetStatus === '1',
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await ExpenseFor.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense For ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteExpenseFor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ExpenseFor.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Expense For ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      message: 'Expense Transfer For has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 10. WORK FOR SITE OF MASTER CONTROLLERS (PHP tbl_work_for_site_of_master)
// ==========================================

exports.getWorkForSiteOfList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      status: { $nin: ['2', 2] }
    };
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: '1' }, { is_active: 1 }, { is_active: true }, { status: '1' }, { status: 1 }, { status: true }];
    }

    const list = await WorkForSiteOf.find(filter).sort({ work_for_site_of_name: 1 });
    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
      return {
        ...doc,
        id: doc.id || doc._id,
        work_for_site_of_name: doc.work_for_site_of_name || doc.name || '',
        name: doc.work_for_site_of_name || doc.name || '',
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch work for site of list', error: error.message });
  }
};

exports.getWorkForSiteOfById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await WorkForSiteOf.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Work For Site Of not found' });
    }
    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        work_for_site_of_name: doc.work_for_site_of_name || doc.name || '',
        name: doc.work_for_site_of_name || doc.name || '',
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addWorkForSiteOf = async (req, res) => {
  try {
    const rawName = req.body.work_for_site_of_name || req.body.work_for || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work For Missing!', message: 'Work For Missing! Please enter work for site of.' });
    }

    const formattedName = rawName.trim();

    // Check duplicate
    const existing = await WorkForSiteOf.findOne({
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_for_site_of_name: new RegExp(`^${formattedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        title: 'Duplicate Data Found!',
        message: 'Duplicate Data Found! Entered work for site of already exists.'
      });
    }

    const newItem = new WorkForSiteOf({
      work_for_site_of_name: formattedName,
      name: formattedName,
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Work for site of has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateWorkForSiteOf = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body.work_for_site_of_name || req.body.work_for || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work For Missing! Please enter work for site of.' });
    }

    const formattedName = rawName.trim();

    // Check duplicate
    const existing = await WorkForSiteOf.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_for_site_of_name: new RegExp(`^${formattedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered work for site of already exists.'
      });
    }

    const updated = await WorkForSiteOf.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['2', 2] } },
      {
        work_for_site_of_name: formattedName,
        name: formattedName,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work For Site Of not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Work for site of has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleWorkForSiteOfStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Work for site of has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Work for site of has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Work for site of has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Work for site of has been activated successfully.';
    }

    const updateFields = {
      is_active: targetStatus,
      status: targetStatus,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await WorkForSiteOf.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work For Site Of ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: targetStatus === '1' ? 'Activated Successfully' : targetStatus === '0' ? 'Deactivated Successfully' : 'Deleted Successfully',
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteWorkForSiteOf = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkForSiteOf.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '2', status: '2', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Work For Site Of ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted Successfully',
      message: 'Work for site of has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 11. NATURE OF WORK MASTER CONTROLLERS (PHP tbl_nature_of_work)
// ==========================================

exports.getNatureOfWorkList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    };
    if (req.query.active_only === 'true') {
      filter.$or = [{ status: '1' }, { status: 1 }, { is_active: true }];
    }

    const list = await NatureOfWork.find(filter).sort({ nature_of_work: 1 });
    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
      return {
        ...doc,
        id: doc.id || doc._id,
        nature_of_work: doc.nature_of_work || doc.name || '',
        name: doc.nature_of_work || doc.name || '',
        is_active: isActive,
        status: isActive ? '1' : '0'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch nature of work list', error: error.message });
  }
};

exports.getNatureOfWorkById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await NatureOfWork.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Nature Of Work not found' });
    }
    const doc = item.toObject ? item.toObject() : { ...item };
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        nature_of_work: doc.nature_of_work || doc.name || '',
        name: doc.nature_of_work || doc.name || ''
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addNatureOfWork = async (req, res) => {
  try {
    const rawName = req.body.nature_of_work || req.body.natureOfWork || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Nature of Work Missing!', message: 'Nature of Work Missing! Please enter nature of work.' });
    }

    const formattedName = rawName.trim();

    // Check duplicate
    const existing = await NatureOfWork.findOne({
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      nature_of_work: new RegExp(`^${formattedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        title: 'Duplicate Data Found!',
        message: 'Duplicate Data Found! Entered nature of work already exists.'
      });
    }

    const newItem = new NatureOfWork({
      nature_of_work: formattedName,
      name: formattedName,
      status: '1',
      is_active: true,
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Nature of work has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateNatureOfWork = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body.nature_of_work || req.body.natureOfWork || req.body.name;
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Nature of Work Missing! Please enter nature of work.' });
    }

    const formattedName = rawName.trim();

    const existing = await NatureOfWork.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      status: { $nin: ['2', 2] },
      nature_of_work: new RegExp(`^${formattedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered nature of work already exists.'
      });
    }

    const updated = await NatureOfWork.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, status: { $nin: ['2', 2] } },
      {
        nature_of_work: formattedName,
        name: formattedName,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Nature of Work not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Nature of work has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteNatureOfWork = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NatureOfWork.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { status: '2', is_deleted: true, is_active: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Work ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted Successfully',
      message: 'Nature of work has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 12. SITE TYPE MASTER CONTROLLERS (PHP tbl_site_type_master)
// ==========================================

exports.getSiteTypeList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      status: { $nin: ['2', 2] }
    };
    if (req.query.work_for_id) {
      filter.work_for_id = String(req.query.work_for_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: '1' }, { is_active: 1 }, { is_active: true }];
    }

    const list = await SiteType.find(filter).sort({ site_type: 1 });

    // Lookup work for site of
    const allWorkFor = jsonDb.find('tbl_work_for_site_of_master', {}) || [];
    const workForMap = {};
    allWorkFor.forEach(w => {
      if (w.id) workForMap[String(w.id)] = w.work_for_site_of_name || w.name;
      if (w._id) workForMap[String(w._id)] = w.work_for_site_of_name || w.name;
    });

    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
      const workForName = workForMap[String(doc.work_for_id)] || doc.work_for || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        site_type: doc.site_type || doc.work_type || doc.name || '',
        work_type: doc.site_type || doc.work_type || doc.name || '',
        name: doc.site_type || doc.work_type || doc.name || '',
        work_for: workForName,
        work_for_site_of_name: workForName,
        work_for_id: String(doc.work_for_id || ''),
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch site types', error: error.message });
  }
};

exports.getSiteTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await SiteType.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Site Type not found' });
    }

    const allWorkFor = jsonDb.find('tbl_work_for_site_of_master', {}) || [];
    const workForMap = {};
    allWorkFor.forEach(w => {
      if (w.id) workForMap[String(w.id)] = w.work_for_site_of_name || w.name;
      if (w._id) workForMap[String(w._id)] = w.work_for_site_of_name || w.name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        site_type: doc.site_type || doc.work_type || doc.name || '',
        work_for: workForMap[String(doc.work_for_id)] || '',
        work_for_site_of_name: workForMap[String(doc.work_for_id)] || '',
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSiteType = async (req, res) => {
  try {
    const workForId = req.body.work_for_id;
    const rawType = req.body.site_type || req.body.work_type || req.body.name;

    if (!workForId || String(workForId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Site Work For Missing!', message: 'Site Work For Missing! Please select site work for.' });
    }
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Site Type Missing!', message: 'Site Type Missing! Please enter site type.' });
    }

    const typeName = rawType.trim();

    // Check duplicate
    const existing = await SiteType.findOne({
      work_for_id: String(workForId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      site_type: new RegExp(`^${typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        title: 'Duplicate Data Found!',
        message: 'Duplicate Data Found! Entered site type already exists for this site work for.'
      });
    }

    const newItem = new SiteType({
      work_for_id: String(workForId),
      site_type: typeName,
      work_type: typeName,
      name: typeName,
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Site type has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateSiteType = async (req, res) => {
  try {
    const { id } = req.params;
    const workForId = req.body.work_for_id;
    const rawType = req.body.site_type || req.body.work_type || req.body.name;

    if (!workForId || String(workForId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Site Work For Missing! Please select site work for.' });
    }
    if (!rawType || rawType.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Site Type Missing! Please enter site type.' });
    }

    const typeName = rawType.trim();

    const existing = await SiteType.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      work_for_id: String(workForId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      site_type: new RegExp(`^${typeName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered site type already exists for this site work for.'
      });
    }

    const updated = await SiteType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['2', 2] } },
      {
        work_for_id: String(workForId),
        site_type: typeName,
        work_type: typeName,
        name: typeName,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Site Type not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Site type has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleSiteTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Site type has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Site type has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Site type has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Site type has been activated successfully.';
    }

    const updateFields = {
      is_active: targetStatus,
      status: targetStatus,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await SiteType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Site Type ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: targetStatus === '1' ? 'Activated Successfully' : targetStatus === '0' ? 'Deactivated Successfully' : 'Deleted Successfully',
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteSiteType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SiteType.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '2', status: '2', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Site Type ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted Successfully',
      message: 'Site type has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 13. WORK MASTER CONTROLLERS (PHP tbl_work_master)
// ==========================================

exports.getWorkList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      status: { $nin: ['2', 2] }
    };
    if (req.query.work_for_id) {
      filter.work_for_id = String(req.query.work_for_id);
    }
    if (req.query.work_type_id) {
      filter.work_type_id = String(req.query.work_type_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: '1' }, { is_active: 1 }, { is_active: true }];
    }

    const list = await WorkMaster.find(filter).sort({ work_name: 1 });

    // Lookups
    const allWorkFor = jsonDb.find('tbl_work_for_site_of_master', {}) || [];
    const workForMap = {};
    allWorkFor.forEach(w => {
      if (w.id) workForMap[String(w.id)] = w.work_for_site_of_name || w.name;
      if (w._id) workForMap[String(w._id)] = w.work_for_site_of_name || w.name;
    });

    const allSiteTypes = jsonDb.find('tbl_site_type_master', {}) || [];
    const siteTypeMap = {};
    allSiteTypes.forEach(s => {
      if (s.id) siteTypeMap[String(s.id)] = s.site_type || s.work_type || s.name;
      if (s._id) siteTypeMap[String(s._id)] = s.site_type || s.work_type || s.name;
    });

    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
      const workForName = workForMap[String(doc.work_for_id)] || '';
      const siteTypeName = siteTypeMap[String(doc.work_type_id)] || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        work_name: doc.work_name || doc.name || '',
        name: doc.work_name || doc.name || '',
        work_for_site_of_name: workForName,
        site_of: workForName,
        site_type: siteTypeName,
        work_type_name: siteTypeName,
        work_for_id: String(doc.work_for_id || ''),
        work_type_id: String(doc.work_type_id || ''),
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch works', error: error.message });
  }
};

exports.getWorkById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await WorkMaster.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }

    const allWorkFor = jsonDb.find('tbl_work_for_site_of_master', {}) || [];
    const workForMap = {};
    allWorkFor.forEach(w => {
      if (w.id) workForMap[String(w.id)] = w.work_for_site_of_name || w.name;
      if (w._id) workForMap[String(w._id)] = w.work_for_site_of_name || w.name;
    });

    const allSiteTypes = jsonDb.find('tbl_site_type_master', {}) || [];
    const siteTypeMap = {};
    allSiteTypes.forEach(s => {
      if (s.id) siteTypeMap[String(s.id)] = s.site_type || s.work_type || s.name;
      if (s._id) siteTypeMap[String(s._id)] = s.site_type || s.work_type || s.name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        work_name: doc.work_name || doc.name || '',
        name: doc.work_name || doc.name || '',
        work_for_site_of_name: workForMap[String(doc.work_for_id)] || '',
        site_type: siteTypeMap[String(doc.work_type_id)] || '',
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addWork = async (req, res) => {
  try {
    const workForId = req.body.work_for_id;
    const workTypeId = req.body.work_type_id || req.body.work_type;
    const rawName = req.body.work_name || req.body.name;

    if (!workForId || String(workForId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Site For Missing!', message: 'Site For Missing! Please select site work type.' });
    }
    if (!workTypeId || String(workTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work Type Missing!', message: 'Work Type Missing! Please select work type.' });
    }
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work Name Missing!', message: 'Work Name Missing! Please enter work name.' });
    }

    const workName = rawName.trim();

    // Check duplicate
    const existing = await WorkMaster.findOne({
      work_for_id: String(workForId),
      work_type_id: String(workTypeId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_name: new RegExp(`^${workName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        title: 'Duplicate Data Found!',
        message: 'Duplicate Data Found! Entered work name already exists for this selection.'
      });
    }

    const newItem = new WorkMaster({
      work_for_id: String(workForId),
      work_type_id: String(workTypeId),
      work_name: workName,
      name: workName,
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Work has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateWork = async (req, res) => {
  try {
    const { id } = req.params;
    const workForId = req.body.work_for_id;
    const workTypeId = req.body.work_type_id || req.body.work_type;
    const rawName = req.body.work_name || req.body.name;

    if (!workForId || String(workForId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Site For Missing! Please select site work type.' });
    }
    if (!workTypeId || String(workTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work Type Missing! Please select work type.' });
    }
    if (!rawName || rawName.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work Name Missing! Please enter work name.' });
    }

    const workName = rawName.trim();

    const existing = await WorkMaster.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      work_for_id: String(workForId),
      work_type_id: String(workTypeId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_name: new RegExp(`^${workName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered work name already exists for this selection.'
      });
    }

    const updated = await WorkMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['2', 2] } },
      {
        work_for_id: String(workForId),
        work_type_id: String(workTypeId),
        work_name: workName,
        name: workName,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Work has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleWorkStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Work has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Work has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Work has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Work has been activated successfully.';
    }

    const updateFields = {
      is_active: targetStatus,
      status: targetStatus,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await WorkMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: targetStatus === '1' ? 'Activated Successfully' : targetStatus === '0' ? 'Deactivated Successfully' : 'Deleted Successfully',
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteWork = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkMaster.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '2', status: '2', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Work ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted Successfully',
      message: 'Work has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 14. WORK DESCRIPTION MASTER CONTROLLERS (PHP tbl_work_description_master)
// ==========================================

exports.getWorkDescriptionList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      status: { $nin: ['2', 2] }
    };
    if (req.query.work_type_id) {
      filter.work_type_id = String(req.query.work_type_id);
    }
    if (req.query.work_name_id) {
      filter.work_name_id = String(req.query.work_name_id);
    }
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: '1' }, { is_active: 1 }, { is_active: true }];
    }

    const list = await WorkDescription.find(filter).sort({ work_description: 1 });

    // Lookups
    const allSiteTypes = jsonDb.find('tbl_site_type_master', {}) || [];
    const siteTypeMap = {};
    allSiteTypes.forEach(s => {
      if (s.id) siteTypeMap[String(s.id)] = s.site_type || s.work_type || s.name;
      if (s._id) siteTypeMap[String(s._id)] = s.site_type || s.work_type || s.name;
    });

    const allWorks = jsonDb.find('tbl_work_master', {}) || [];
    const workMap = {};
    allWorks.forEach(w => {
      if (w.id) workMap[String(w.id)] = w.work_name || w.name;
      if (w._id) workMap[String(w._id)] = w.work_name || w.name;
    });

    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
      const siteTypeName = siteTypeMap[String(doc.work_type_id)] || '';
      const workName = workMap[String(doc.work_name_id)] || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        work_description: doc.work_description || doc.name || '',
        name: doc.work_description || doc.name || '',
        site_type: siteTypeName,
        work_type_name: siteTypeName,
        work_name: workName,
        aging_days: doc.aging_days !== undefined ? doc.aging_days : '',
        work_type_id: String(doc.work_type_id || ''),
        work_name_id: String(doc.work_name_id || ''),
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch work descriptions', error: error.message });
  }
};

exports.getWorkDescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await WorkDescription.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Work Description not found' });
    }

    const allSiteTypes = jsonDb.find('tbl_site_type_master', {}) || [];
    const siteTypeMap = {};
    allSiteTypes.forEach(s => {
      if (s.id) siteTypeMap[String(s.id)] = s.site_type || s.work_type || s.name;
      if (s._id) siteTypeMap[String(s._id)] = s.site_type || s.work_type || s.name;
    });

    const allWorks = jsonDb.find('tbl_work_master', {}) || [];
    const workMap = {};
    allWorks.forEach(w => {
      if (w.id) workMap[String(w.id)] = w.work_name || w.name;
      if (w._id) workMap[String(w._id)] = w.work_name || w.name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    const isActive = doc.is_active === '1' || doc.is_active === 1 || doc.is_active === true;
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        work_description: doc.work_description || doc.name || '',
        name: doc.work_description || doc.name || '',
        site_type: siteTypeMap[String(doc.work_type_id)] || '',
        work_name: workMap[String(doc.work_name_id)] || '',
        aging_days: doc.aging_days,
        is_active: isActive ? '1' : '0',
        status: isActive ? '1' : '0'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addWorkDescription = async (req, res) => {
  try {
    const workTypeId = req.body.work_type_id || req.body.work_type;
    const workNameId = req.body.work_name_id || req.body.work_name;
    const rawDesc = req.body.work_description || req.body.name;
    const agingDays = req.body.aging_days !== undefined ? req.body.aging_days : '';

    if (!workTypeId || String(workTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work Type Missing!', message: 'Work Type Missing! Please select work type.' });
    }
    if (!workNameId || String(workNameId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work Name Missing!', message: 'Work Name Missing! Please select work name.' });
    }
    if (!rawDesc || rawDesc.trim() === '') {
      return res.status(400).json({ success: false, flag: false, title: 'Work Description Missing!', message: 'Work Description Missing! Please enter work description.' });
    }
    if (agingDays === '' || agingDays === undefined || agingDays === null) {
      return res.status(400).json({ success: false, flag: false, title: 'Aging Days Missing!', message: 'Aging Days Missing! Please enter work aging days.' });
    }

    const workDesc = rawDesc.trim();

    // Check duplicate
    const existing = await WorkDescription.findOne({
      work_type_id: String(workTypeId),
      work_name_id: String(workNameId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_description: new RegExp(`^${workDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        title: 'Duplicate Data Found!',
        message: 'Duplicate Data Found! Entered work description already exists for this selection.'
      });
    }

    const newItem = new WorkDescription({
      work_type_id: String(workTypeId),
      work_name_id: String(workNameId),
      work_description: workDesc,
      name: workDesc,
      aging_days: String(agingDays).replace(/[^0-9]/g, ''),
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      created_by: req.user ? req.user.id : '1'
    });

    await newItem.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Work description has been saved successfully.',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateWorkDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const workTypeId = req.body.work_type_id || req.body.work_type;
    const workNameId = req.body.work_name_id || req.body.work_name;
    const rawDesc = req.body.work_description || req.body.name;
    const agingDays = req.body.aging_days !== undefined ? req.body.aging_days : '';

    if (!workTypeId || String(workTypeId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work Type Missing! Please select work type.' });
    }
    if (!workNameId || String(workNameId).trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work Name Missing! Please select work name.' });
    }
    if (!rawDesc || rawDesc.trim() === '') {
      return res.status(400).json({ success: false, flag: false, message: 'Work Description Missing! Please enter work description.' });
    }

    const workDesc = rawDesc.trim();

    const existing = await WorkDescription.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      work_type_id: String(workTypeId),
      work_name_id: String(workNameId),
      is_deleted: { $ne: true },
      is_active: { $nin: ['2', 2] },
      work_description: new RegExp(`^${workDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        flag: false,
        message: 'Duplicate Data Found! Entered work description already exists for this selection.'
      });
    }

    const updated = await WorkDescription.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['2', 2] } },
      {
        work_type_id: String(workTypeId),
        work_name_id: String(workNameId),
        work_description: workDesc,
        name: workDesc,
        aging_days: String(agingDays).replace(/[^0-9]/g, ''),
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: req.user ? req.user.id : '1'
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work Description not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Work description has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.toggleWorkDescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status } = req.body;

    let targetStatus = '1';
    let message = 'Work description has been activated successfully.';

    if (type === 'deactivate' || status === false || status === 0 || status === '0') {
      targetStatus = '0';
      message = 'Work description has been deactivated successfully.';
    } else if (type === 'delete' || status === 2 || status === '2') {
      targetStatus = '2';
      message = 'Work description has been deleted successfully.';
    } else if (type === 'activate' || status === true || status === 1 || status === '1') {
      targetStatus = '1';
      message = 'Work description has been activated successfully.';
    }

    const updateFields = {
      is_active: targetStatus,
      status: targetStatus,
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (targetStatus === '2') updateFields.is_deleted = true;

    const updated = await WorkDescription.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      updateFields,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Work Description ID is missing or not found.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: targetStatus === '1' ? 'Activated Successfully' : targetStatus === '0' ? 'Deactivated Successfully' : 'Deleted Successfully',
      message,
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteWorkDescription = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await WorkDescription.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '2', status: '2', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Work Description ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted Successfully',
      message: 'Work description has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// ==========================================
// 15. VENDOR MASTER DATA CONTROLLERS (PHP MasterController replica)
// ==========================================

const createVendorMasterCrud = (Model, primaryField, displayName) => {
  return {
    getList: async (req, res) => {
      try {
        const filter = {
          is_deleted: { $ne: true },
          is_active: { $nin: ['0', 0, '2', 2, false] }
        };
        const list = await Model.find(filter);
        const formatted = (list || []).map(item => {
          const doc = item.toObject ? item.toObject() : { ...item };
          const val = doc[primaryField] || doc.name || '';
          return {
            ...doc,
            id: doc.id || doc._id,
            [primaryField]: val,
            name: val,
            is_active: '1',
            status: '1'
          };
        });
        res.status(200).json({ success: true, data: formatted });
      } catch (error) {
        res.status(500).json({ success: false, message: `Failed to fetch ${displayName} list`, error: error.message });
      }
    },

    getById: async (req, res) => {
      try {
        const { id } = req.params;
        const item = await Model.findOne({
          $or: [{ _id: id }, { id: id }],
          is_deleted: { $ne: true },
          is_active: { $nin: ['0', 0, '2', 2, false] }
        });
        if (!item) {
          return res.status(404).json({ success: false, message: `${displayName} not found` });
        }
        const doc = item.toObject ? item.toObject() : { ...item };
        const val = doc[primaryField] || doc.name || '';
        res.status(200).json({
          success: true,
          data: {
            ...doc,
            id: doc.id || doc._id,
            [primaryField]: val,
            name: val,
            is_active: '1',
            status: '1'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    },

    add: async (req, res) => {
      try {
        const rawVal = req.body[primaryField] || req.body.name;
        if (!rawVal || String(rawVal).trim() === '') {
          return res.status(400).json({
            success: false,
            flag: false,
            title: `${displayName} Missing!`,
            message: `${displayName} Missing! Please enter ${displayName.toLowerCase()}.`
          });
        }

        const formattedVal = String(rawVal).trim();

        // Duplicate check (case-insensitive)
        const existing = await Model.findOne({
          is_deleted: { $ne: true },
          is_active: { $nin: ['0', 0, '2', 2, false] },
          [primaryField]: new RegExp(`^${formattedVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            flag: false,
            title: 'Duplicate Data Found!',
            message: `Duplicate Data Found! Entered ${displayName.toLowerCase()} already exists.`
          });
        }

        const newItem = new Model({
          [primaryField]: formattedVal,
          name: formattedVal,
          is_active: '1',
          status: '1',
          is_deleted: false,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          created_by: req.user ? req.user.id : '1'
        });

        await newItem.save();
        res.status(201).json({
          success: true,
          flag: true,
          title: 'Saved Successfully',
          message: `${displayName} master has been saved successfully.`,
          data: newItem
        });
      } catch (error) {
        res.status(500).json({ success: false, flag: false, message: error.message });
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params;
        const rawVal = req.body[primaryField] || req.body.name;
        if (!rawVal || String(rawVal).trim() === '') {
          return res.status(400).json({
            success: false,
            flag: false,
            message: `${displayName} Missing! Please enter ${displayName.toLowerCase()}.`
          });
        }

        const formattedVal = String(rawVal).trim();

        // Duplicate check
        const existing = await Model.findOne({
          _id: { $ne: id },
          id: { $ne: id },
          is_deleted: { $ne: true },
          is_active: { $nin: ['0', 0, '2', 2, false] },
          [primaryField]: new RegExp(`^${formattedVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            flag: false,
            message: `Duplicate Data Found! Entered ${displayName.toLowerCase()} already exists.`
          });
        }

        const updated = await Model.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['0', 0, '2', 2, false] } },
          {
            [primaryField]: formattedVal,
            name: formattedVal,
            updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            updated_by: req.user ? req.user.id : '1'
          },
          { new: true }
        );

        if (!updated) {
          return res.status(404).json({ success: false, flag: false, message: `${displayName} not found` });
        }

        res.status(200).json({
          success: true,
          flag: true,
          title: 'Updated Successfully',
          message: `${displayName} master has been updated successfully.`,
          data: updated
        });
      } catch (error) {
        res.status(500).json({ success: false, flag: false, message: error.message });
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await Model.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }] },
          { is_active: '0', status: '0', is_deleted: true },
          { new: true }
        );

        if (!deleted) {
          return res.status(404).json({ success: false, flag: false, message: `${displayName} master ID is missing. Please try again.` });
        }

        res.status(200).json({
          success: true,
          flag: true,
          title: 'Deleted Successfully',
          message: `${displayName} master has been deleted successfully.`
        });
      } catch (error) {
        res.status(500).json({ success: false, flag: false, message: error.message });
      }
    }
  };
};

// 1. Vendor Experience
const vendorExperienceCrud = createVendorMasterCrud(VendorExperience, 'experience', 'Vendor experience');
exports.getVendorExperienceList = vendorExperienceCrud.getList;
exports.getVendorExperienceById = vendorExperienceCrud.getById;
exports.addVendorExperience = vendorExperienceCrud.add;
exports.updateVendorExperience = vendorExperienceCrud.update;
exports.deleteVendorExperience = vendorExperienceCrud.delete;

// 2. Organization Type
const organizationTypeCrud = createVendorMasterCrud(OrganizationType, 'organization_type', 'Organization type');
exports.getOrganizationTypeList = organizationTypeCrud.getList;
exports.getOrganizationTypeById = organizationTypeCrud.getById;
exports.addOrganizationType = organizationTypeCrud.add;
exports.updateOrganizationType = organizationTypeCrud.update;
exports.deleteOrganizationType = organizationTypeCrud.delete;

// 3. Association Years
const associationYearsCrud = createVendorMasterCrud(AssociationYears, 'association_years', 'Association years');
exports.getAssociationYearsList = associationYearsCrud.getList;
exports.getAssociationYearsById = associationYearsCrud.getById;
exports.addAssociationYears = associationYearsCrud.add;
exports.updateAssociationYears = associationYearsCrud.update;
exports.deleteAssociationYears = associationYearsCrud.delete;

// 4. Geographical Presence
const geographicalPresenceCrud = createVendorMasterCrud(GeographicalPresence, 'geographical_presence', 'Geographical presence');
exports.getGeographicalPresenceList = geographicalPresenceCrud.getList;
exports.getGeographicalPresenceById = geographicalPresenceCrud.getById;
exports.addGeographicalPresence = geographicalPresenceCrud.add;
exports.updateGeographicalPresence = geographicalPresenceCrud.update;
exports.deleteGeographicalPresence = geographicalPresenceCrud.delete;

// 5. Major Clients
const majorClientsCrud = createVendorMasterCrud(MajorClients, 'major_clients', 'Major clients');
exports.getMajorClientsList = majorClientsCrud.getList;
exports.getMajorClientsById = majorClientsCrud.getById;
exports.addMajorClients = majorClientsCrud.add;
exports.updateMajorClients = majorClientsCrud.update;
exports.deleteMajorClients = majorClientsCrud.delete;

// 6. Team Strength
const teamStrengthCrud = createVendorMasterCrud(TeamStrength, 'team_strength', 'Team strength');
exports.getTeamStrengthList = teamStrengthCrud.getList;
exports.getTeamStrengthById = teamStrengthCrud.getById;
exports.addTeamStrength = teamStrengthCrud.add;
exports.updateTeamStrength = teamStrengthCrud.update;
exports.deleteTeamStrength = teamStrengthCrud.delete;

// 7. Annual Turnover
const annualTurnoverCrud = createVendorMasterCrud(AnnualTurnover, 'annual_turnover', 'Annual turnover');
exports.getAnnualTurnoverList = annualTurnoverCrud.getList;
exports.getAnnualTurnoverById = annualTurnoverCrud.getById;
exports.addAnnualTurnover = annualTurnoverCrud.add;
exports.updateAnnualTurnover = annualTurnoverCrud.update;
exports.deleteAnnualTurnover = annualTurnoverCrud.delete;

// 8. Work Handling Amount
const workHandlingAmountCrud = createVendorMasterCrud(WorkHandleAmount, 'work_handling_amount', 'Work handling amount');
exports.getWorkHandlingAmountList = workHandlingAmountCrud.getList;
exports.getWorkHandlingAmountById = workHandlingAmountCrud.getById;
exports.addWorkHandlingAmount = workHandlingAmountCrud.add;
exports.updateWorkHandlingAmount = workHandlingAmountCrud.update;
exports.deleteWorkHandlingAmount = workHandlingAmountCrud.delete;

// ==========================================
// 16. PRODUCT MASTER DATA CONTROLLERS (PHP MasterController replica)
// ==========================================

// --- Product Suppliers (tbl_suppliers) ---
exports.getProductSuppliers = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] }
    };
    const list = await ProductSupplier.find(filter).sort({ name: 1 });
    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      return {
        ...doc,
        id: doc.id || doc._id,
        name: doc.name || '',
        supplier_name: doc.name || '',
        contact_1: doc.contact_1 || doc.mobile_no || '',
        mobile_no: doc.contact_1 || doc.mobile_no || '',
        contact_2: doc.contact_2 || doc.alternate_mobie || '',
        alternate_mobie: doc.contact_2 || doc.alternate_mobie || '',
        address: doc.address || '',
        gst_number: doc.gst_number || doc.gst_no || '',
        gst_no: doc.gst_number || doc.gst_no || '',
        is_active: '1',
        status: '1'
      };
    });
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers', error: error.message });
  }
};

exports.getProductSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProductSupplier.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const doc = item.toObject ? item.toObject() : { ...item };
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        name: doc.name || '',
        supplier_name: doc.name || '',
        contact_1: doc.contact_1 || doc.mobile_no || '',
        mobile_no: doc.contact_1 || doc.mobile_no || '',
        contact_2: doc.contact_2 || doc.alternate_mobie || '',
        alternate_mobie: doc.contact_2 || doc.alternate_mobie || '',
        address: doc.address || '',
        gst_number: doc.gst_number || doc.gst_no || '',
        gst_no: doc.gst_number || doc.gst_no || '',
        is_active: '1',
        status: '1'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addProductSupplier = async (req, res) => {
  try {
    const rawName = req.body.name || req.body.supplier_name;
    const mobileNo = req.body.contact_1 || req.body.mobile_no;
    const alternateMobile = req.body.contact_2 || req.body.alternate_mobie || '';
    const gstNumber = req.body.gst_number || req.body.gst_no;
    const address = req.body.address;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter supplier name.' });
    }
    if (!mobileNo || !String(mobileNo).trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter mobile number.' });
    }
    if (!gstNumber || !String(gstNumber).trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter GST number.' });
    }
    if (!address || !String(address).trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter address.' });
    }

    const supplierName = rawName.trim();

    // Duplicate check
    const existing = await ProductSupplier.findOne({
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] },
      name: new RegExp(`^${supplierName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, flag: false, message: 'Entered supplier already exists.' });
    }

    const newSupplier = new ProductSupplier({
      name: supplierName,
      contact_1: String(mobileNo).trim(),
      contact_2: String(alternateMobile).trim(),
      gst_number: String(gstNumber).trim(),
      address: String(address).trim(),
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    await newSupplier.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Supplier has been saved successfully.',
      data: newSupplier
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateProductSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body.name || req.body.supplier_name;
    const mobileNo = req.body.contact_1 || req.body.mobile_no;
    const alternateMobile = req.body.contact_2 || req.body.alternate_mobie || '';
    const gstNumber = req.body.gst_number || req.body.gst_no;
    const address = req.body.address;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter supplier name.' });
    }

    const supplierName = rawName.trim();

    const existing = await ProductSupplier.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] },
      name: new RegExp(`^${supplierName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, flag: false, message: 'Entered supplier already exists.' });
    }

    const updated = await ProductSupplier.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['0', 0, '2', 2, false] } },
      {
        name: supplierName,
        contact_1: mobileNo ? String(mobileNo).trim() : '',
        contact_2: alternateMobile ? String(alternateMobile).trim() : '',
        gst_number: gstNumber ? String(gstNumber).trim() : '',
        address: address ? String(address).trim() : '',
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Supplier not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Supplier has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteProductSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductSupplier.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '0', status: '0', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Supplier ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted',
      message: 'Supplier has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// --- Products / Product List (tbl_products) ---
exports.getProductList = async (req, res) => {
  try {
    const filter = {
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] }
    };
    if (req.query.product_type_id) {
      filter.product_type_id = String(req.query.product_type_id);
    }
    const list = await ProductList.find(filter).sort({ product_name: 1 });

    // Lookups for product types
    const allTypes = jsonDb.find('tbl_product_type', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.product_type_name;
      if (t._id) typeMap[String(t._id)] = t.product_type_name;
    });

    const formatted = (list || []).map(item => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const typeName = typeMap[String(doc.product_type_id)] || '';
      return {
        ...doc,
        id: doc.id || doc._id,
        product_name: doc.product_name || doc.name || '',
        name: doc.product_name || doc.name || '',
        product_type_id: String(doc.product_type_id || ''),
        product_type_name: typeName,
        unit: doc.unit || '',
        price: doc.price !== undefined ? String(doc.price) : '0',
        product_group: doc.product_group || '',
        is_active: '1',
        status: '1'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProductList.findOne({
      $or: [{ _id: id }, { id: id }],
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] }
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const allTypes = jsonDb.find('tbl_product_type', {}) || [];
    const typeMap = {};
    allTypes.forEach(t => {
      if (t.id) typeMap[String(t.id)] = t.product_type_name;
      if (t._id) typeMap[String(t._id)] = t.product_type_name;
    });

    const doc = item.toObject ? item.toObject() : { ...item };
    res.status(200).json({
      success: true,
      data: {
        ...doc,
        id: doc.id || doc._id,
        product_name: doc.product_name || doc.name || '',
        name: doc.product_name || doc.name || '',
        product_type_id: String(doc.product_type_id || ''),
        product_type_name: typeMap[String(doc.product_type_id)] || '',
        unit: doc.unit || '',
        price: doc.price !== undefined ? String(doc.price) : '0',
        is_active: '1',
        status: '1'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const rawName = req.body.product_name || req.body.name;
    const productTypeId = req.body.product_type_id || req.body.product_category;
    const unit = req.body.unit;
    const price = req.body.price;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter product name.' });
    }
    if (!productTypeId) {
      return res.status(400).json({ success: false, flag: false, message: 'Please select product category / type.' });
    }
    if (!unit || !String(unit).trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please select product unit.' });
    }

    const productName = rawName.trim();

    const existing = await ProductList.findOne({
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] },
      product_name: new RegExp(`^${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, flag: false, message: 'Entered product already exists.' });
    }

    const newProduct = new ProductList({
      product_name: productName,
      name: productName,
      product_type_id: String(productTypeId),
      unit: String(unit).trim(),
      price: price ? String(price) : '0',
      is_active: '1',
      status: '1',
      is_deleted: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });

    await newProduct.save();
    res.status(201).json({
      success: true,
      flag: true,
      title: 'Saved Successfully',
      message: 'Product has been saved successfully.',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const rawName = req.body.product_name || req.body.name;
    const productTypeId = req.body.product_type_id || req.body.product_category;
    const unit = req.body.unit;
    const price = req.body.price;

    if (!rawName || !rawName.trim()) {
      return res.status(400).json({ success: false, flag: false, message: 'Please enter product name.' });
    }

    const productName = rawName.trim();

    const existing = await ProductList.findOne({
      _id: { $ne: id },
      id: { $ne: id },
      is_deleted: { $ne: true },
      is_active: { $nin: ['0', 0, '2', 2, false] },
      product_name: new RegExp(`^${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
    });

    if (existing) {
      return res.status(400).json({ success: false, flag: false, message: 'Entered product already exists.' });
    }

    const updated = await ProductList.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }], is_deleted: { $ne: true }, is_active: { $nin: ['0', 0, '2', 2, false] } },
      {
        product_name: productName,
        name: productName,
        product_type_id: productTypeId ? String(productTypeId) : undefined,
        unit: unit ? String(unit).trim() : undefined,
        price: price !== undefined ? String(price) : undefined,
        updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, flag: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Updated Successfully',
      message: 'Product has been updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProductList.findOneAndUpdate(
      { $or: [{ _id: id }, { id: id }] },
      { is_active: '0', status: '0', is_deleted: true },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, flag: false, message: 'Product ID is missing. Please try again.' });
    }

    res.status(200).json({
      success: true,
      flag: true,
      title: 'Deleted',
      message: 'Product has been deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, flag: false, message: error.message });
  }
};

// --- Product Type (tbl_product_type) ---
const productTypeCrud = createVendorMasterCrud(ProductType, 'product_type_name', 'Product type');
exports.getProductTypeList = productTypeCrud.getList;
exports.getProductTypeById = productTypeCrud.getById;
exports.addProductType = productTypeCrud.add;
exports.updateProductType = productTypeCrud.update;
exports.deleteProductType = productTypeCrud.delete;

// --- Product Unit (tbl_material_unit) ---
const productUnitCrud = createVendorMasterCrud(ProductUnit, 'unit_name', 'Product unit');
exports.getProductUnitList = productUnitCrud.getList;
exports.getProductUnitById = productUnitCrud.getById;
exports.addProductUnit = productUnitCrud.add;
exports.updateProductUnit = productUnitCrud.update;
exports.deleteProductUnit = productUnitCrud.delete;

// --- Product Brand (tbl_material_brand) ---
const productBrandCrud = createVendorMasterCrud(ProductBrand, 'brand_name', 'Product brand');
exports.getProductBrandList = productBrandCrud.getList;
exports.getProductBrandById = productBrandCrud.getById;
exports.addProductBrand = productBrandCrud.add;
exports.updateProductBrand = productBrandCrud.update;
exports.deleteProductBrand = productBrandCrud.delete;

// ==========================================
// 17. DYNAMIC CRUD CONTROLLER (FOR ALL MASTER DATA ENTITIES)
// ==========================================

const resolveMasterModel = (collectionName) => {
  const normalizedKey = (collectionName || '').toLowerCase().replace(/[-_]/g, '');
  if (masterModelMap[normalizedKey]) {
    return masterModelMap[normalizedKey];
  }
  if (masterModelMap[collectionName.toLowerCase()]) {
    return masterModelMap[collectionName.toLowerCase()];
  }
  return createJsonModel(collectionName);
};

exports.getDynamicList = async (req, res) => {
  try {
    const { collection } = req.params;
    const Model = resolveMasterModel(collection);
    
    // Always exclude soft-deleted items unless explicitly asked
    const filter = { is_deleted: { $ne: true } };
    if (req.query.active_only === 'true') {
      filter.$or = [{ is_active: true }, { status: true }, { is_active: 1 }, { is_active: '1' }];
    }

    let data = await Model.find(filter).sort({ createdAt: -1 });

    if (collection.toLowerCase().includes('expensetype')) {
      data = (data || []).filter(item => item.status != '2' && item.status != 2 && item.is_deleted !== true).map(item => {
        const doc = item.toObject ? item.toObject() : { ...item };
        const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
        return {
          ...doc,
          expense_type: doc.expense_type || doc.name || '',
          name: doc.expense_type || doc.name || '',
          is_active: isActive,
          status: isActive
        };
      });
    }

    if (collection.toLowerCase().includes('expensein')) {
      const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
      const typeMap = {};
      allTypes.forEach(t => {
        if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
        if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
      });

      data = (data || []).filter(item => item.status != '2' && item.status != 2 && item.is_deleted !== true).map(item => {
        const doc = item.toObject ? item.toObject() : { ...item };
        const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
        const typeName = typeMap[String(doc.expense_type_id)] || doc.expense_type_name || '';
        return {
          ...doc,
          expense_in_type: doc.expense_in_type || doc.name || '',
          name: doc.expense_in_type || doc.name || '',
          expense_type_name: typeName,
          expense_type: typeName,
          is_active: isActive,
          status: isActive
        };
      });
    }

    if (collection.toLowerCase().includes('expensefor')) {
      const allTypes = jsonDb.find('tbl_expense_type_master', {}) || [];
      const typeMap = {};
      allTypes.forEach(t => {
        if (t.id) typeMap[String(t.id)] = t.expense_type || t.name;
        if (t._id) typeMap[String(t._id)] = t.expense_type || t.name;
      });

      const allIns = jsonDb.find('tbl_expense_in_type_master', {}) || [];
      const inMap = {};
      allIns.forEach(i => {
        if (i.id) inMap[String(i.id)] = i.expense_in_type || i.name;
        if (i._id) inMap[String(i._id)] = i.expense_in_type || i.name;
      });

      data = (data || []).filter(item => item.status != '2' && item.status != 2 && item.is_deleted !== true).map(item => {
        const doc = item.toObject ? item.toObject() : { ...item };
        const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
        const typeName = typeMap[String(doc.expense_type_id)] || doc.expense_type_name || '';
        const inName = inMap[String(doc.expense_in_id)] || doc.expense_in_name || '';
        return {
          ...doc,
          expense_transfer_for: doc.expense_transfer_for || doc.name || '',
          name: doc.expense_transfer_for || doc.name || '',
          expense_type_name: typeName,
          expense_type: typeName,
          expense_in_name: inName,
          expense_in_type: inName,
          is_active: isActive,
          status: isActive
        };
      });
    }

    if (collection.toLowerCase().includes('roletype')) {
      data = (data || []).filter(item => item.status != '2' && item.status != 2 && item.is_deleted !== true).map(item => {
        const doc = item.toObject ? item.toObject() : { ...item };
        const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
        return {
          ...doc,
          role_type: doc.role_type || doc.name || '',
          name: doc.role_type || doc.name || '',
          is_active: isActive,
          status: isActive
        };
      });
    }

    if (collection.toLowerCase().includes('role') && !collection.toLowerCase().includes('roletype')) {
      const allTypes = jsonDb.find('tbl_role_type', {}) || [];
      const typeMap = {};
      allTypes.forEach(t => {
        if (t.id) typeMap[String(t.id)] = t.role_type;
        if (t._id) typeMap[String(t._id)] = t.role_type;
      });

      data = (data || []).filter(item => item.status != '2' && item.status != 2 && item.is_deleted !== true).map(item => {
        const doc = item.toObject ? item.toObject() : { ...item };
        const isActive = doc.status === '1' || doc.status === 1 || doc.is_active === true;
        const typeName = typeMap[String(doc.role_type)] || doc.role_type_name || '';
        return {
          ...doc,
          role: doc.role || doc.name || '',
          name: doc.role || doc.name || '',
          role_type_name: typeName,
          is_active: isActive,
          status: isActive
        };
      });
    }

    if (collection.toLowerCase().includes('debitaccount')) {
      data = (data || []).map(acc => {
        const doc = acc.toObject ? acc.toObject() : { ...acc };
        const isActive = doc.is_active === true || doc.is_active === 1 || doc.is_active === '1' || doc.status === true;
        return {
          ...doc,
          debit_account: doc.debit_account || doc.name || '',
          name: doc.debit_account || doc.name || '',
          is_active: isActive,
          status: isActive
        };
      });
    }

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
    if (bodyData.status === undefined && bodyData.is_active !== undefined) {
      bodyData.status = bodyData.is_active;
    }

    if (collection.toLowerCase().includes('debitaccount')) {
      const rawName = bodyData.debit_account || bodyData.name;
      if (rawName) {
        bodyData.debit_account = rawName.trim();
        bodyData.name = rawName.trim();
      }
    }

    if (collection.toLowerCase().includes('expensetype')) {
      const rawName = bodyData.expense_type || bodyData.name;
      if (rawName) {
        bodyData.expense_type = rawName.trim();
        bodyData.name = rawName.trim();
      }
    }

    if (collection.toLowerCase().includes('expensein')) {
      const rawName = bodyData.expense_in_type || bodyData.name;
      if (rawName) {
        bodyData.expense_in_type = rawName.trim();
        bodyData.name = rawName.trim();
      }
      if (bodyData.expense_type_id) {
        bodyData.expense_type_id = String(bodyData.expense_type_id);
      }
    }

    if (collection.toLowerCase().includes('expensefor')) {
      const rawName = bodyData.expense_transfer_for || bodyData.expenseFor || bodyData.name;
      if (rawName) {
        bodyData.expense_transfer_for = rawName.trim();
        bodyData.name = rawName.trim();
      }
      if (bodyData.expense_type_id) {
        bodyData.expense_type_id = String(bodyData.expense_type_id);
      }
      if (bodyData.expense_in_id) {
        bodyData.expense_in_id = String(bodyData.expense_in_id);
      }
    }

    if (collection.toLowerCase().includes('roletype')) {
      const rawType = bodyData.role_type || bodyData.name;
      if (rawType) {
        bodyData.role_type = toTitleCase(rawType.trim());
        bodyData.name = bodyData.role_type;
      }
    }

    if (collection.toLowerCase().includes('role') && !collection.toLowerCase().includes('roletype')) {
      const rawRole = bodyData.role || bodyData.name;
      if (rawRole) {
        bodyData.role = rawRole.trim();
        bodyData.name = rawRole.trim();
      }
      if (bodyData.role_type_id && !bodyData.role_type) {
        bodyData.role_type = String(bodyData.role_type_id);
      }
    }

    if (collection.toLowerCase().includes('bankaccount')) {
      const accHolder = bodyData.account_holder_name || bodyData.account_name;
      if (accHolder) {
        bodyData.account_holder_name = accHolder;
        bodyData.account_name = accHolder;
      }
      const accNum = bodyData.bank_account_number || bodyData.account_number;
      if (accNum) {
        bodyData.bank_account_number = accNum;
        bodyData.account_number = accNum;
      }
      const ifsc = bodyData.bank_ifsc_code || bodyData.ifsc_code;
      if (ifsc) {
        bodyData.bank_ifsc_code = ifsc;
        bodyData.ifsc_code = ifsc;
      }
      const branch = bodyData.bank_branch || bodyData.branch_name;
      if (branch) {
        bodyData.bank_branch = branch;
        bodyData.branch_name = branch;
      }
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
    if (bodyData.is_active !== undefined && bodyData.status === undefined) {
      bodyData.status = bodyData.is_active;
    }

    if (collection.toLowerCase().includes('debitaccount')) {
      const rawName = bodyData.debit_account || bodyData.name;
      if (rawName) {
        bodyData.debit_account = rawName.trim();
        bodyData.name = rawName.trim();
      }
    }

    if (collection.toLowerCase().includes('expensetype')) {
      const rawName = bodyData.expense_type || bodyData.name;
      if (rawName) {
        bodyData.expense_type = rawName.trim();
        bodyData.name = rawName.trim();
      }
    }

    if (collection.toLowerCase().includes('expensein')) {
      const rawName = bodyData.expense_in_type || bodyData.name;
      if (rawName) {
        bodyData.expense_in_type = rawName.trim();
        bodyData.name = rawName.trim();
      }
      if (bodyData.expense_type_id) {
        bodyData.expense_type_id = String(bodyData.expense_type_id);
      }
    }

    if (collection.toLowerCase().includes('expensefor')) {
      const rawName = bodyData.expense_transfer_for || bodyData.expenseFor || bodyData.name;
      if (rawName) {
        bodyData.expense_transfer_for = rawName.trim();
        bodyData.name = rawName.trim();
      }
      if (bodyData.expense_type_id) {
        bodyData.expense_type_id = String(bodyData.expense_type_id);
      }
      if (bodyData.expense_in_id) {
        bodyData.expense_in_id = String(bodyData.expense_in_id);
      }
    }

    if (collection.toLowerCase().includes('roletype')) {
      const rawType = bodyData.role_type || bodyData.name;
      if (rawType) {
        bodyData.role_type = toTitleCase(rawType.trim());
        bodyData.name = bodyData.role_type;
      }
    }

    if (collection.toLowerCase().includes('role') && !collection.toLowerCase().includes('roletype')) {
      const rawRole = bodyData.role || bodyData.name;
      if (rawRole) {
        bodyData.role = rawRole.trim();
        bodyData.name = rawRole.trim();
      }
      if (bodyData.role_type_id && !bodyData.role_type) {
        bodyData.role_type = String(bodyData.role_type_id);
      }
    }

    if (collection.toLowerCase().includes('bankaccount')) {
      const accHolder = bodyData.account_holder_name || bodyData.account_name;
      if (accHolder) {
        bodyData.account_holder_name = accHolder;
        bodyData.account_name = accHolder;
      }
      const accNum = bodyData.bank_account_number || bodyData.account_number;
      if (accNum) {
        bodyData.bank_account_number = accNum;
        bodyData.account_number = accNum;
      }
      const ifsc = bodyData.bank_ifsc_code || bodyData.ifsc_code;
      if (ifsc) {
        bodyData.bank_ifsc_code = ifsc;
        bodyData.ifsc_code = ifsc;
      }
      const branch = bodyData.bank_branch || bodyData.branch_name;
      if (branch) {
        bodyData.bank_branch = branch;
        bodyData.branch_name = branch;
      }
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
