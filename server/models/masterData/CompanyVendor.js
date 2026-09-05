const mongoose = require('mongoose');

const companyVendorSchema = new mongoose.Schema({
  vendor_company_name: {
    type: String,
    required: true,
    trim: true
  },
  contact_person_name: {
    type: String,
    trim: true
  },
  contact_number: {
    type: String,
    trim: true
  },
  pan_number: {
    type: String,
    trim: true,
    uppercase: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CompanyVendor', companyVendorSchema);
