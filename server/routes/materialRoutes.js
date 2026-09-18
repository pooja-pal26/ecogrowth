const express = require('express');
const router = express.Router();
const controller = require('../controllers/materialController');

// Master Data & Cascading Lookups
router.get('/master-data', controller.getMasterData);
router.get('/products-by-type/:typeId', controller.getProductsByType);
router.get('/product-stock/:typeId/:productId', controller.getProductStock);
router.get('/sites-by-po/:poNo', controller.getSitesByPo);

// Stock Report
router.get('/stock-report', controller.getStockReport);

// Stock In & Out Transactions
router.post('/stock-in', controller.stockIn);
router.post('/stock-out', controller.stockOut);

// Transaction History
router.get('/stock-in-history', controller.getStockInHistory);
router.get('/stock-out-history', controller.getStockOutHistory);

module.exports = router;