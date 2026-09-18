const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

// Filter Options
router.get('/filters', controller.getFilterOptions);

// Stock In Report & Details
router.get('/stock-in', controller.getStockInReport);
router.get('/stock-in/:id', controller.getStockInDetails);

// Stock Out Report & Details
router.get('/stock-out', controller.getStockOutReport);
router.get('/stock-out/:id', controller.getStockOutDetails);

// Overall Stock Summary
router.get('/stock-summary', controller.getStockSummary);

// Site Financial Summary (matching PHP summary-report.phtml)
router.get('/site-financial-summary', controller.getSiteFinancialSummary);

module.exports = router;