const mongoose = require('mongoose');

const siteExpenseSchema = new mongoose.Schema({
  po_no: { type: String, required: true },
  site_id: { type: String, required: true },
  amount: { type: Number, required: true },
  transfer_date: { type: Date, required: true },
  status: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteExpense', siteExpenseSchema, 'tbl_site_expense');
