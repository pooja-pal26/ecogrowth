const mongoose = require('mongoose');

const clientMasterSchema = new mongoose.Schema({
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  client_name: {
    type: String,
    required: true,
    trim: true
  },
  contact_number: {
    type: String,
    trim: true
  },
  client_gst: {
    type: String,
    trim: true,
    uppercase: true
  },
  client_billing_address: {
    type: String,
    trim: true
  },
  client_shipping_address: {
    type: String,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ClientMaster', clientMasterSchema);
