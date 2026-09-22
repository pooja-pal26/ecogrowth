const express = require('express');
const router = express.Router();
const controller = require('../controllers/expenseController');
const multer = require('multer');
const config = require('../config');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const upload = multer({ dest: config.app.uploadPath || 'uploads/' });

// Form initialization data (Expense Types, Companies, Bank Accounts, Debit Accounts, etc.)
router.get('/form-data', controller.getExpenseFormData);

// Sites allocated by PO Number
router.get('/sites-by-po/:poNo', controller.getSitesByPoNumber);

// Expense In options for an Expense Type ID
router.get('/expense-in/:expenseTypeId', controller.getExpenseInList);

// Expense For options for an Expense In ID
router.get('/expense-for/:expenseInId', controller.getExpenseForList);

// Create New Expense (Site Expense or Office Expense)
router.post('/create', upload.any(), controller.createExpense);

// Reports
router.get('/site-report', controller.getSiteExpenseReport);
router.get('/office-report', controller.getOfficeExpenseReport);
router.get('/fund-transfer-report', controller.getB2BFundTransferReport);

module.exports = router;
