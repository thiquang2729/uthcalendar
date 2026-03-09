const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  runTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Thành công', 'Thất bại'],
    required: true,
  },
  eventsAdded: {
    type: Number,
    default: 0,
  },
  eventsUpdated: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  logLines: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('SyncLog', syncLogSchema);
