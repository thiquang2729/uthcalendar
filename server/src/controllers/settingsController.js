const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne({ userId: req.user });
    if (!setting) {
      return res.status(404).json({ message: 'Không tìm thấy cấu hình' });
    }

    // Không trả về password và refresh token thật
    const safeData = {
      uthConfig: { ...setting.uthConfig.toObject(), password: setting.uthConfig.password ? '******' : '' },
      googleConfig: { 
        isConnected: !!setting.googleConfig.accessToken,
        calendarId: setting.googleConfig.calendarId
      },
      automationConfig: setting.automationConfig,
    };

    res.json(safeData);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy cấu hình', error: error.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { uthConfig, googleConfig, automationConfig } = req.body;
    let setting = await Setting.findOne({ userId: req.user });

    if (!setting) {
       // Trong trường hợp này sẽ không vào vì login đã bắt lỗi này
       return res.status(404).json({ message: 'Không tìm thấy cấu hình' });
    }

    if (uthConfig) {
      setting.uthConfig.studentId = uthConfig.studentId || setting.uthConfig.studentId;
      setting.uthConfig.baseUrl = uthConfig.baseUrl || setting.uthConfig.baseUrl;
      
      // Nếu có gửi password mới (không phải chuỗi sao) thì mới mã hóa và lưu
      if (uthConfig.password && uthConfig.password !== '******') {
        const CryptoJS = require('crypto-js'); // Re-import CryptoJS here as it's used
        const encrypted = CryptoJS.AES.encrypt(uthConfig.password, process.env.ENCRYPTION_KEY).toString();
        setting.uthConfig.password = encrypted;
      }
    }

    if (googleConfig && googleConfig.calendarId !== undefined) {
      setting.googleConfig.calendarId = googleConfig.calendarId;
    }

    if (automationConfig) {
      setting.automationConfig = { ...setting.automationConfig.toObject(), ...automationConfig };
    }

    await setting.save();
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật cấu hình', error: error.message });
  }
};
