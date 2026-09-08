const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String, amount: Number, status: { type: String, default: "Pending" }, clientId: { type: mongoose.Schema.Types.ObjectId, ref: "ClientMaster" }, poId: { type: mongoose.Schema.Types.ObjectId, ref: "PoSite" }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);