const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetName: String, assetType: String, serialNumber: String, status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);