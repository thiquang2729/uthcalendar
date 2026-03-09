const { google } = require('googleapis');
const Setting = require('../models/Setting');

const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// GET /api/google/auth-url
exports.getAuthUrl = async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',
    });
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo URL xác thực Google', error: error.message });
  }
};

// POST /api/google/callback
exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Thiếu mã xác quyền' });
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(404).json({ message: 'Chưa có cấu hình' });
    }

    setting.googleConfig.accessToken = tokens.access_token;
    setting.googleConfig.refreshToken = tokens.refresh_token || setting.googleConfig.refreshToken;
    await setting.save();

    res.json({ message: 'Liên kết Google Calendar thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xử lý callback Google', error: error.message });
  }
};

// GET /api/google/calendars
exports.getCalendars = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting || !setting.googleConfig.accessToken) {
      return res.status(400).json({ message: 'Chưa liên kết tài khoản Google' });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: setting.googleConfig.accessToken,
      refresh_token: setting.googleConfig.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();

    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách lịch', error: error.message });
  }
};
