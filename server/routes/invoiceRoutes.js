const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id/pdf', controller.downloadPdf);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;