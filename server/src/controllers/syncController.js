const SyncLog = require('../models/SyncLog');
const scraperService = require('../services/scraper');
const googleCalendarService = require('../services/googleCalendar');

// POST /api/sync/run
exports.runSync = async (req, res) => {
  const logLines = [];
  const log = (msg) => logLines.push(`[${new Date().toLocaleTimeString('vi-VN')}] ${msg}`);

  try {
    log('Bắt đầu tiến trình đồng bộ...');

    // Bước 1: Cào dữ liệu từ UTH
    log('Đang đăng nhập vào cổng UTH...');
    const scheduleData = await scraperService.scrapeSchedule();
    log(`Tìm thấy ${scheduleData.length} môn học`);

    // Bước 2: Đồng bộ lên Google Calendar
    log('Đang kết nối Google Calendar...');
    const result = await googleCalendarService.syncEvents(scheduleData);
    log(`Đã thêm ${result.added} sự kiện mới, cập nhật ${result.updated} sự kiện`);

    log('Đồng bộ hoàn tất!');

    // Lưu nhật ký
    await SyncLog.create({
      status: 'Thành công',
      eventsAdded: result.added,
      eventsUpdated: result.updated,
      logLines,
    });

    res.json({ status: 'Thành công', logLines });
  } catch (error) {
    log(`LỖI: ${error.message}`);

    await SyncLog.create({
      status: 'Thất bại',
      errorMessage: error.message,
      logLines,
    });

    res.status(500).json({ status: 'Thất bại', logLines, error: error.message });
  }
};

// GET /api/sync/preview?date=2026-03-09
exports.previewSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const scheduleData = await scraperService.scrapeSchedule(date);
    res.json({ success: true, events: scheduleData });
  } catch (error) {
    console.error('Lỗi preview lịch học:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

