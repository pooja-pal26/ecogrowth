const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialName: String, quantity: Number, unit: String, status: { type: String, default: "Available" }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);