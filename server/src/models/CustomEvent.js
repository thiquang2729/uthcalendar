const mongoose = require('mongoose');

const customEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  isSynced: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('CustomEvent', customEventSchema);
