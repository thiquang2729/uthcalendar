const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Setting = require('../models/Setting');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    }

    let setting = await Setting.findOne();

    // Nếu chưa có bản ghi Setting, tạo mới với mật khẩu mặc định
    if (!setting) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      setting = await Setting.create({ adminPassword: hashedPassword });
    }

    const isMatch = await bcrypt.compare(password, setting.adminPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
