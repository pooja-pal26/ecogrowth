const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');

// Punched Invoices routes
router.get('/', controller.getAll);
router.get('/punch-init', controller.getPunchInitData);
router.post('/', controller.create);
router.post('/punch', controller.create);
router.post('/change-view-status-and-update', controller.changeViewStatusAndUpdate);
router.post('/change-view-status-and-update-invoice', controller.changeViewStatusAndUpdate);
router.post('/attach-payment-advice-to-invoice', controller.attachPaymentAdvice);
router.post('/attach-payment-advice', controller.attachPaymentAdvice);

// Services & Products routes
router.get('/services-products', controller.getServicesProducts);
router.post('/services-products', controller.addServiceProduct);
router.put('/services-products/:id', controller.updateServiceProduct);
router.post('/services-products/:id/toggle-status', controller.toggleServiceStatus);
router.delete('/services-products/:id', (req, res) => {
  req.body = { action: 'delete' };
  return controller.toggleServiceStatus(req, res);
});

// Generate Invoice routes
router.get('/generate-init', controller.getGenerateInvoiceInitData);
router.post('/save-generated', controller.saveGeneratedInvoice);

// Monthly Invoice routes
router.get('/monthly', controller.getMonthlyInvoices);
router.post('/monthly', controller.addMonthlyInvoice);
router.delete('/monthly/:id', controller.deleteMonthlyInvoice);

router.get('/:id/pdf', controller.downloadPdf);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;