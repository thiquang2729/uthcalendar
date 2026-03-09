const puppeteer = require('puppeteer');
const Setting = require('../models/Setting');
const SubjectSetting = require('../models/SubjectSetting');
const CryptoJS = require('crypto-js');

/**
 * Cào dữ liệu lịch học từ cổng thông tin UTH
 * @returns {Array} Mảng các sự kiện lịch học
 */
exports.scrapeSchedule = async () => {
  const setting = await Setting.findOne();
  if (!setting) throw new Error('Chưa có cấu hình hệ thống');

  const { studentId, password, baseUrl, selectors } = setting.uthConfig;
  if (!studentId || !password || !baseUrl) {
    throw new Error('Thiếu thông tin cấu hình UTH (studentId, password, baseUrl)');
  }

  // Giải mã mật khẩu
  const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

  // TODO: Triển khai chi tiết cào dữ liệu theo cấu trúc trang UTH thực tế
  // Placeholder - sẽ được triển khai khi có thông tin chi tiết về trang UTH
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(baseUrl);

    // Đăng nhập
    // await page.type(selectors.studentIdInput, studentId);
    // await page.type(selectors.passwordInput, decryptedPassword);
    // await page.click(selectors.loginButton);

    // Bóc tách dữ liệu thời khóa biểu
    // const scheduleData = await page.evaluate(...)

    return []; // Placeholder
  } finally {
    await browser.close();
  }
};
