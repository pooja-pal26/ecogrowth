const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: String, contactPerson: String, contactNumber: String, email: String, status: { type: String, default: "Active" }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);