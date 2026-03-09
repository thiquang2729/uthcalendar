const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Setting = require('../models/Setting');

// Tạo token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Kiểm tra user tồn tại
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo User mới
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    // Tự động tạo bảng Setting trống (để lưu token Google và UTH) cho User này
    await Setting.create({ userId: user._id });

    // Trả về token
    res.status(201).json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
      message: 'Đăng ký thành công',
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm user và xác thực
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mật khẩu không chính xác' });
    }

    // Đảm bảo User có Setting, nếu rớt mất thì tạo lại chặn lỗi thủ công
    const settingExists = await Setting.findOne({ userId: user._id });
    if (!settingExists) {
       await Setting.create({ userId: user._id });
    }

    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id),
      message: 'Đăng nhập thành công',
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
  }
};
