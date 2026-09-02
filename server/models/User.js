const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'tbl_user'); // mapped to tbl_user
