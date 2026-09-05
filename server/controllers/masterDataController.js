const State = require('../models/masterData/State');

// Utility to handle dynamic model mapping if needed in future
// For now, we will implement explicit controllers for the Core phase

// --- STATE LIST ---
exports.getStates = async (req, res) => {
  try {
    const states = await State.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch states', error: error.message });
  }
};

exports.addState = async (req, res) => {
  try {
    const { state_name, state_code } = req.body;
    
    if (!state_name || !state_code) {
      return res.status(400).json({ success: false, message: 'State Name and State Code are required' });
    }

    const newState = new State({ state_name, state_code });
    await newState.save();
    
    res.status(201).json({ success: true, message: 'State added successfully', data: newState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add state', error: error.message });
  }
};

exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state_name, state_code } = req.body;

    const updatedState = await State.findByIdAndUpdate(
      id, 
      { state_name, state_code },
      { new: true, runValidators: true }
    );

    if (!updatedState) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State updated successfully', data: updatedState });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update state', error: error.message });
  }
};

exports.deleteState = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedState = await State.findByIdAndDelete(id);
    
    if (!deletedState) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.status(200).json({ success: true, message: 'State deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete state', error: error.message });
  }
};

// --- CLIENT MASTER ---
const ClientMaster = require('../models/masterData/ClientMaster');

exports.getClients = async (req, res) => {
  try {
    const clients = await ClientMaster.find().populate('state_id', 'state_name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch clients', error: error.message });
  }
};

exports.addClient = async (req, res) => {
  try {
    const newClient = new ClientMaster(req.body);
    await newClient.save();
    res.status(201).json({ success: true, message: 'Client added successfully', data: newClient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add client', error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClient = await ClientMaster.findByIdAndUpdate(
      id, 
      req.body,
      { new: true, runValidators: true }
    );
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
    const deletedClient = await ClientMaster.findByIdAndDelete(id);
    if (!deletedClient) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete client', error: error.message });
  }
};

// --- COMPANY VENDOR ---
const CompanyVendor = require('../models/masterData/CompanyVendor');

exports.getCompanyVendors = async (req, res) => {
  try {
    const vendors = await CompanyVendor.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: error.message });
  }
};

exports.addCompanyVendor = async (req, res) => {
  try {
    const newVendor = new CompanyVendor(req.body);
    await newVendor.save();
    res.status(201).json({ success: true, message: 'Vendor added successfully', data: newVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add vendor', error: error.message });
  }
};

exports.updateCompanyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVendor = await CompanyVendor.findByIdAndUpdate(
      id, 
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, message: 'Vendor updated successfully', data: updatedVendor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update vendor', error: error.message });
  }
};

exports.deleteCompanyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVendor = await CompanyVendor.findByIdAndDelete(id);
    if (!deletedVendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    res.status(200).json({ success: true, message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete vendor', error: error.message });
  }
};
