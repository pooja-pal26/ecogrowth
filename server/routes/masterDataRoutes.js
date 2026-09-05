const express = require('express');
const router = express.Router();
const masterDataController = require('../controllers/masterDataController');

// --- State List Routes ---
router.get('/states', masterDataController.getStates);
router.post('/states', masterDataController.addState);
router.put('/states/:id', masterDataController.updateState);
router.delete('/states/:id', masterDataController.deleteState);

// --- Client Master Routes ---
router.get('/clients', masterDataController.getClients);
router.post('/clients', masterDataController.addClient);
router.put('/clients/:id', masterDataController.updateClient);
router.delete('/clients/:id', masterDataController.deleteClient);

module.exports = router;
