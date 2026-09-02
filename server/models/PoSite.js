const mongoose = require('mongoose');

const poSiteSchema = new mongoose.Schema({
  po_no: { type: String, required: true },
  site_id: { type: String, required: true },
  is_deleted: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PoSite', poSiteSchema, 'tbl_po_sites');
