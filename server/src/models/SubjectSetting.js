const mongoose = require('mongoose');

const subjectSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
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
    default: '', // Mã màu Google Calendar, rỗng nghĩa là dùng màu tự động
  },
  reminderMinutes: {
    type: Number,
    default: 30,
  },
}, { timestamps: true });

module.exports = mongoose.model('SubjectSetting', subjectSettingSchema);
