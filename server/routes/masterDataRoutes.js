const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

// --- State List Routes ---
router.get('/states', masterDataController.getStates);
router.get('/states/:id', masterDataController.getStateById);
router.post('/states', masterDataController.addState);
router.put('/states/:id', masterDataController.updateState);
router.delete('/states/:id', masterDataController.deleteState);

// --- Client Master Routes ---
router.get('/clients', masterDataController.getClients);
router.get('/clients/:id', masterDataController.getClientDetails);
router.post('/clients', masterDataController.addClient);
router.put('/clients/:id', masterDataController.updateClient);
router.patch('/clients/:id/status', masterDataController.toggleClientStatus);
router.delete('/clients/:id', masterDataController.deleteClient);

// --- Company Vendor Routes ---
router.get('/company-vendors', masterDataController.getCompanyVendors);
router.get('/company-vendors/:id', masterDataController.getCompanyVendorById);
router.post('/company-vendors', masterDataController.addCompanyVendor);
router.put('/company-vendors/:id', masterDataController.updateCompanyVendor);
router.patch('/company-vendors/:id/status', masterDataController.toggleCompanyVendorStatus);
router.delete('/company-vendors/:id', masterDataController.deleteCompanyVendor);

// --- DYNAMIC CRUD ROUTES ---
// Catch-all routes for any master data collection
router.get('/dynamic/:collection', masterDataController.getDynamicList);
router.post('/dynamic/:collection', masterDataController.addDynamicItem);
router.put('/dynamic/:collection/:id', masterDataController.updateDynamicItem);
router.delete('/dynamic/:collection/:id', masterDataController.deleteDynamicItem);

module.exports = router;
