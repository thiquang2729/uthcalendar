const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uthConfig: {
    studentId: { type: String, default: '' },
    password: { type: String, default: '' }, // Mã hóa đối xứng
    baseUrl: { type: String, default: '' },
    selectors: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  googleConfig: {
    accessToken: { type: String, default: '' },
    refreshToken: { type: String, default: '' },
    calendarId: { type: String, default: '' },
  },
  automationConfig: {
    cronSchedule: { type: String, default: '0 6 * * *' }, // Mặc định 6h sáng mỗi ngày
    telegramBotToken: { type: String, default: '' },
    telegramChatId: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
