const mongoose = require('mongoose');

const companyVendorSchema = new mongoose.Schema({
  vendor_company_name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  contact_person_name: {
    type: String,
    required: [true, 'Contact person name is required'],
    trim: true
  },
  contact_number: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  pan_number: {
    type: String,
    required: [true, 'PAN number is required'],
    trim: true,
    uppercase: true
  },
  gst_number: {
    type: String,
    trim: true,
    uppercase: true
  },
  proprietor_name: {
    type: String,
    trim: true
  },
  company_address: {
    type: String,
    trim: true
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
}, { timestamps: true, collection: 'companyvendors' });

module.exports = mongoose.models.CompanyVendor || mongoose.model('CompanyVendor', companyVendorSchema);
