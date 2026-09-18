const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendorController');

router.get('/master-data', controller.getVendorMasterData);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.post('/:id/deactivate', controller.deactivate);
router.post('/:id/activate', controller.activate);
router.delete('/:id', controller.delete);

module.exports = router;