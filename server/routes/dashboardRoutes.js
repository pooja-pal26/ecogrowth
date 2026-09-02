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

module.exports = router;
