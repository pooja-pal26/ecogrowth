const express = require('express');
const router = express.Router();
const expenseDashboardController = require('../controllers/expenseDashboardController');

router.get('/overview', expenseDashboardController.getOverview);
router.get('/breakdown', expenseDashboardController.getBreakdown);

module.exports = router;
