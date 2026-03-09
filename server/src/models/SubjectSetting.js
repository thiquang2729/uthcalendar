const mongoose = require('mongoose');

const subjectSettingSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: true,
    unique: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  isIgnored: {
    type: Boolean,
    default: false,
  },
  colorId: {
    type: String,
    default: '1', // Mã màu Google Calendar
  },
  reminderMinutes: {
    type: Number,
    default: 30,
  },
}, { timestamps: true });

module.exports = mongoose.model('SubjectSetting', subjectSettingSchema);
