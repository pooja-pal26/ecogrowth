const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  poNumber: String, poDate: Date, status: { type: String, default: 'Pending' }, siteId: String,
  state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientMaster' }
}, { timestamps: true });
module.exports = mongoose.models.PoSite || mongoose.model('PoSite', schema);