const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  poNumber: String, siteId: String, status: { type: String, default: 'Pending' }
}, { timestamps: true });
module.exports = mongoose.models.SiteAllocation || mongoose.model('SiteAllocation', schema);