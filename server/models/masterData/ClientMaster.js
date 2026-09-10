const mongoose = require('mongoose');

const clientMasterSchema = new mongoose.Schema({
  state_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: [true, 'State is required']
  },
  client_name: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
    uppercase: true
  },
  contact_number: {
    type: String,
    trim: true
  },
  client_contact_number: {
    type: String,
    trim: true
  },
  client_gst: {
    type: String,
    required: [true, 'Client GST is required'],
    trim: true,
    uppercase: true
  },
  client_billing_address: {
    type: String,
    required: [true, 'Client billing address is required'],
    trim: true,
    uppercase: true
  },
  client_shipping_address: {
    type: String,
    required: [true, 'Client shipping address is required'],
    trim: true,
    uppercase: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true, collection: 'clientmasters' });

// Ensure contact_number and client_contact_number stay synchronized
clientMasterSchema.pre('save', function (next) {
  if (this.contact_number && !this.client_contact_number) {
    this.client_contact_number = this.contact_number;
  } else if (this.client_contact_number && !this.contact_number) {
    this.contact_number = this.client_contact_number;
  }
  next();
});

module.exports = mongoose.models.ClientMaster || mongoose.model('ClientMaster', clientMasterSchema);
