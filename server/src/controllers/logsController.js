const SyncLog = require('../models/SyncLog');

// GET /api/logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await SyncLog.find({ userId: req.user })
      .sort({ createdAt: -1 })
      .limit(50); // Lấy 50 log gần nhất của user này
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy nhật ký', error: error.message });
  }
};
