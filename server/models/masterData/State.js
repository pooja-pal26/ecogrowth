const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  state_name: {
    type: String,
    required: [true, 'State name is required'],
    trim: true
  },
  state_code: {
    type: String,
    trim: true,
    default: ''
  },
  legacy_id: {
    type: Number
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
}, { timestamps: true, collection: 'states' });

module.exports = mongoose.models.State || mongoose.model('State', stateSchema);
