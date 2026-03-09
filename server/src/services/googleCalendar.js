const { google } = require('googleapis');
const Setting = require('../models/Setting');
const SubjectSetting = require('../models/SubjectSetting');
const CustomEvent = require('../models/CustomEvent');

const getAuthClient = async () => {
  const setting = await Setting.findOne();
  if (!setting || !setting.googleConfig.accessToken) {
    throw new Error('Chưa liên kết tài khoản Google');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: setting.googleConfig.accessToken,
    refresh_token: setting.googleConfig.refreshToken,
  });

  // Xử lý refresh token tự động
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      setting.googleConfig.accessToken = tokens.access_token;
      await setting.save();
    }
  });

  return { oauth2Client, calendarId: setting.googleConfig.calendarId };
};

/**
 * Đồng bộ sự kiện lên Google Calendar
 * @param {Array} scheduleData - Dữ liệu lịch học đã bóc tách
 * @returns {Object} { added, updated }
 */
exports.syncEvents = async (scheduleData) => {
  const { oauth2Client, calendarId } = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  let added = 0;
  let updated = 0;

  // Lấy danh sách môn bị bỏ qua
  const ignoredSubjects = await SubjectSetting.find({ isIgnored: true });
  const ignoredCodes = new Set(ignoredSubjects.map((s) => s.subjectCode));

  // Lọc bỏ môn bị bỏ qua
  const filteredSchedule = scheduleData.filter(
    (item) => !ignoredCodes.has(item.subjectCode)
  );

  // Lấy cấu hình màu sắc và nhắc nhở
  const subjectSettings = await SubjectSetting.find();
  const settingsMap = {};
  subjectSettings.forEach((s) => {
    settingsMap[s.subjectCode] = s;
  });

  // TODO: Triển khai chi tiết so sánh và đẩy sự kiện
  // Placeholder cho luồng xử lý chính
  for (const item of filteredSchedule) {
    const subjectSetting = settingsMap[item.subjectCode];

    const event = {
      summary: item.subjectName,
      location: item.room || '',
      start: { dateTime: item.startTime },
      end: { dateTime: item.endTime },
      colorId: subjectSetting?.colorId || '1',
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: subjectSetting?.reminderMinutes || 30 },
        ],
      },
    };

    // Thêm hoặc cập nhật sự kiện
    // await calendar.events.insert({ calendarId, resource: event });
    added++;
  }

  // Đồng bộ sự kiện cá nhân
  const customEvents = await CustomEvent.find({ isSynced: false });
  for (const ce of customEvents) {
    // await calendar.events.insert(...)
    ce.isSynced = true;
    await ce.save();
    added++;
  }

  return { added, updated };
};
