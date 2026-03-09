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
    // Bỏ ID của user hiện tại vào state để lúc google chuyển hướng về còn biết ai đăng nhập
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',
      state: req.user, // Add user ID here
    });
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo URL xác thực Google', error: error.message });
  }
};

// GET /api/google/callback
exports.handleCallback = async (req, res) => {
  try {
    const { code, error, state } = req.query; // Lấy từ query parameters
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Nếu Google trả về lỗi (VD người dùng từ chối cấp quyền)
    if (error) {
      return res.redirect(`${clientUrl}/calendar-config?error=${error}`);
    }
    
    if (!code) {
      return res.redirect(`${clientUrl}/calendar-config?error=missing_code`);
    }

    if (!state) {
        return res.redirect(`${clientUrl}/calendar-config?error=missing_state`);
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    const setting = await Setting.findOne({ userId: state }); // Lấy lại UserId từ state Google trả về
    if (!setting) {
      return res.redirect(`${clientUrl}/calendar-config?error=no_settings`);
    }

    // Cập nhật cấu hình
    setting.googleConfig.accessToken = tokens.access_token;
    setting.googleConfig.isConnected = true;
    if (tokens.refresh_token) {
      setting.googleConfig.refreshToken = tokens.refresh_token; 
    }
    await setting.save();

    // Redirect về giao diện frontend với thông báo thành công
    res.redirect(`${clientUrl}/calendar-config?success=1`);
  } catch (error) {
    console.error('Lỗi callback Google:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/calendar-config?error=internal_error`);
  }
};

// GET /api/google/calendars
exports.getCalendars = async (req, res) => {
  try {
    const setting = await Setting.findOne({ userId: req.user });
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
