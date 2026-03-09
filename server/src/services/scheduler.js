const cron = require('node-cron');
const Setting = require('../models/Setting');
const syncController = require('../controllers/syncController');

// Quản lý nhiều job cùng lúc
const activeJobs = new Map();

/**
 * Khởi động hoặc cập nhật lịch trình chạy tự động
 */
exports.startScheduler = async () => {
  try {
    const settings = await Setting.find({ 'automationConfig.cronSchedule': { $exists: true, $ne: '' } });
    
    // Dừng tất cả các job cũ trước khi làm mới
    activeJobs.forEach(job => job.stop());
    activeJobs.clear();

    settings.forEach((setting) => {
      const schedule = setting.automationConfig.cronSchedule;
      const userId = setting.userId.toString();

      if (!schedule || !cron.validate(schedule)) {
        return; // Bỏ qua nếu không hợp lệ
      }

      const job = cron.schedule(schedule, async () => {
        console.log(`[${new Date().toLocaleString('vi-VN')}] Chạy đồng bộ tự động cho User: ${userId}`);

        // Giả lập req/res để gọi controller
        const mockReq = { user: userId };
        const mockRes = {
          json: (data) => console.log(`Tiến trình đồng bộ user ${userId}:`, data.status),
          status: (code) => ({ json: (data) => console.error(`Lỗi đồng bộ user ${userId}:`, data.error) }),
        };

        await syncController.runSync(mockReq, mockRes);
      });

      activeJobs.set(userId, job);
    });

    console.log(`Đã kích hoạt lịch trình tự động cho ${activeJobs.size} User.`);
  } catch (error) {
    console.error('Lỗi khởi động scheduler:', error.message);
  }
};
