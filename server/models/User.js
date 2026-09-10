const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  first_name: { type: String, trim: true },
  last_name: { type: String, trim: true },
  email_id: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  plain_password: { type: String },
  contact_no: { type: String, trim: true },
  department: { type: String, trim: true },
  role_type: { type: String, trim: true },
  role: { type: String, default: 'user', trim: true },
  location: { type: String, trim: true },
  status: { type: Number, default: 1 }, // 1 => active, 0 => deactive
  is_deleted: { type: Number, default: 0 }, // 0 => not deleted, 1 => deleted
  legacy_id: { type: Number },
  login_time: { type: Date }
}, { timestamps: true, collection: 'tbl_user' });

module.exports = mongoose.models.User || mongoose.model('User', userSchema, 'tbl_user');
