const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
// const { protect } = require('../middleware/authMiddleware'); // Uncomment if auth is required

// router.use(protect);

router.get('/total-sites', dashboardController.getTotalSites);
router.get('/pending-sites', dashboardController.getPendingSites);
router.get('/allocated-sites', dashboardController.getAllocatedSites);
router.get('/completed-sites', dashboardController.getCompletedSites);
router.get('/expenses/site', dashboardController.getSiteExpenses);
router.get('/expenses/office', dashboardController.getOfficeExpenses);

router.get('/assets', dashboardController.getTotalAssets);
router.get('/invoices', dashboardController.getTotalInvoices);
router.get('/materials', dashboardController.getTotalMaterials);
router.get('/users', dashboardController.getTotalUsers);
router.get('/vendors', dashboardController.getTotalVendors);



router.get('/charts/scurve', dashboardController.getScurveData);
router.get('/charts/material-stock', dashboardController.getMaterialStockChart);
router.get('/charts/invoices', dashboardController.getInvoiceDataChart);
router.get('/charts/po-amounts', dashboardController.getPoAmountsChart);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;

