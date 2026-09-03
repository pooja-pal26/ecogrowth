const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  state_name: {
    type: String,
    required: true,
    trim: true
  },
  state_code: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('State', stateSchema);
