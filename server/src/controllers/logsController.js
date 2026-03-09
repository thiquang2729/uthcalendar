const SyncLog = require('../models/SyncLog');

// GET /api/logs
exports.getLogs = async (req, res) => {
  try {
    const logs = await SyncLog.find()
      .sort({ runTime: -1 })
      .limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
