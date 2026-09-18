const express = require('express');
const router = express.Router();
const controller = require('../controllers/assetController');

// Init Master Data
router.get('/init', controller.getAssetInitData);
router.get('/init-data', controller.getAssetInitData);

// Asset Types CRUD
router.get('/types', controller.getAssetTypes);
router.post('/types', controller.createAssetType);
router.put('/types/:id', controller.updateAssetType);
router.delete('/types/:id', controller.deleteAssetType);

// Asset Assignments & Lifecycle (Assign, Return, Transfer)
router.get('/assignments', controller.getAssignments);
router.post('/assign', controller.assignAsset);
router.post('/return', controller.returnAsset);
router.post('/transfer', controller.transferAsset);

// Assets Inventory CRUD
router.get('/', controller.getAssets);
router.get('/:id', controller.getAssetById);
router.post('/', controller.createAsset);
router.put('/:id', controller.updateAsset);
router.delete('/:id', controller.deleteAsset);

module.exports = router;