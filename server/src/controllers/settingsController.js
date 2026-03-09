const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');

// GET /api/settings
exports.getSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    if (!setting) {
      return res.status(404).json({ message: 'Chưa có cấu hình' });
    }

    // Ẩn mật khẩu và token nhạy cảm
    const safeSettings = {
      uthConfig: {
        studentId: setting.uthConfig.studentId,
        baseUrl: setting.uthConfig.baseUrl,
        selectors: setting.uthConfig.selectors,
        hasPassword: !!setting.uthConfig.password,
      },
      googleConfig: {
        calendarId: setting.googleConfig.calendarId,
        isConnected: !!(setting.googleConfig.accessToken && setting.googleConfig.refreshToken),
      },
      automationConfig: setting.automationConfig,
    };

    res.json(safeSettings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PUT /api/settings
exports.updateSettings = async (req, res) => {
  try {
    const { uthConfig, automationConfig, newAdminPassword } = req.body;
    const setting = await Setting.findOne();

    if (!setting) {
      return res.status(404).json({ message: 'Chưa có cấu hình' });
    }

    if (uthConfig) {
      if (uthConfig.studentId !== undefined) setting.uthConfig.studentId = uthConfig.studentId;
      if (uthConfig.password !== undefined) {
        const CryptoJS = require('crypto-js');
        setting.uthConfig.password = CryptoJS.AES.encrypt(uthConfig.password, process.env.ENCRYPTION_KEY).toString();
      }
      if (uthConfig.baseUrl !== undefined) setting.uthConfig.baseUrl = uthConfig.baseUrl;
      if (uthConfig.selectors !== undefined) setting.uthConfig.selectors = uthConfig.selectors;
    }

    if (automationConfig) {
      Object.assign(setting.automationConfig, automationConfig);
    }

    if (newAdminPassword) {
      setting.adminPassword = await bcrypt.hash(newAdminPassword, 10);
    }

    await setting.save();
    res.json({ message: 'Cập nhật cấu hình thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
