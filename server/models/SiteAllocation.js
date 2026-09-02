const mongoose = require('mongoose');

const siteAllocationSchema = new mongoose.Schema({
  po_no: { type: String, required: true },
  site_id: { type: String, required: true },
  site_completion_status: { type: Number, default: 0 },
  close_status: { type: Number, default: 0 },
  status: { type: Number, default: 1 },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteAllocation', siteAllocationSchema, 'tbl_site_allocation');
