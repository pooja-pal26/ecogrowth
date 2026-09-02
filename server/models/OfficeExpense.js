const mongoose = require('mongoose');

const officeExpenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  transfer_date: { type: Date, required: true },
  is_deleted: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OfficeExpense', officeExpenseSchema, 'tbl_office_expense');
