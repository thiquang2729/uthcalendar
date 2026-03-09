const cron = require('node-cron');
const Setting = require('../models/Setting');
const syncController = require('../controllers/syncController');

let currentJob = null;

/**
 * Khởi động hoặc cập nhật lịch trình chạy tự động
 */
exports.startScheduler = async () => {
  try {
    const setting = await Setting.findOne();
    if (!setting) return;

    const schedule = setting.automationConfig.cronSchedule;
    if (!schedule || !cron.validate(schedule)) {
      console.log('Lịch trình cron không hợp lệ hoặc chưa được cấu hình');
      return;
    }

    // Dừng job cũ nếu có
    if (currentJob) {
      currentJob.stop();
    }

    currentJob = cron.schedule(schedule, async () => {
      console.log(`[${new Date().toLocaleString('vi-VN')}] Chạy đồng bộ tự động...`);

      // Giả lập req/res để gọi controller
      const mockReq = {};
      const mockRes = {
        json: (data) => console.log('Kết quả đồng bộ:', data.status),
        status: (code) => ({ json: (data) => console.error('Lỗi đồng bộ:', data.error) }),
      };

      await syncController.runSync(mockReq, mockRes);
    });

    console.log(`Đã kích hoạt lịch trình tự động: ${schedule}`);
  } catch (error) {
    console.error('Lỗi khởi động scheduler:', error.message);
  }
};
