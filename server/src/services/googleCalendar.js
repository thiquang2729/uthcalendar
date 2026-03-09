const { google } = require('googleapis');
const Setting = require('../models/Setting');
const SubjectSetting = require('../models/SubjectSetting');
const CustomEvent = require('../models/CustomEvent');

const getAuthClient = async () => {
  const setting = await Setting.findOne();
  if (!setting || !setting.googleConfig.accessToken) {
    throw new Error('Chưa liên kết tài khoản Google');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: setting.googleConfig.accessToken,
    refresh_token: setting.googleConfig.refreshToken,
  });

  // Xử lý refresh token tự động
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      setting.googleConfig.accessToken = tokens.access_token;
      await setting.save();
    }
  });

  return { oauth2Client, calendarId: setting.googleConfig.calendarId || 'primary' };
};

/**
 * Đồng bộ sự kiện lên Google Calendar
 * @param {Array} scheduleData - Dữ liệu lịch học đã bóc tách
 * @returns {Object} { added, updated }
 */
exports.syncEvents = async (scheduleData) => {
  const { oauth2Client, calendarId } = await getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  let added = 0;
  let updated = 0;

  // Lấy danh sách môn bị bỏ qua
  const ignoredSubjects = await SubjectSetting.find({ isIgnored: true });
  const ignoredCodes = new Set(ignoredSubjects.map((s) => s.subjectCode));

  // Lọc bỏ môn bị bỏ qua
  const filteredSchedule = scheduleData.filter(
    (item) => !ignoredCodes.has(item.subjectCode)
  );

  // Lấy cấu hình màu sắc và nhắc nhở
  const subjectSettings = await SubjectSetting.find();
  const settingsMap = {};
  subjectSettings.forEach((s) => {
    settingsMap[s.subjectCode] = s;
  });

  const getValidEventId = (prefix, originId) => {
    // Google Event ID yêu cầu chữ thường và số (Base32/hex), độ dài 5-1024
    // Ta lấy ID học phần UTH, bỏ ký tự đặc biệt, chuyển thành lowercase
    return `uth${prefix}${originId}`.replace(/[^a-v0-9]/g, '').toLowerCase();
  };

  // Đồng bộ lịch học
  for (const item of filteredSchedule) {
    const subjectSetting = settingsMap[item.subjectCode];

    const eventId = getValidEventId('sche', item.id);

    // Xác định màu theo ca học
    // Bảng màu Google Calendar Event (colorId 1-11)
    // 1: Lavender (Ca 1 - Sáng thư thái)
    // 2: Sage (Ca 2 - Trưa nhẹ nhàng)
    // 5: Banana (Ca 3 - Chiều năng động)
    // 6: Tangerine (Ca 4 - Chiều muộn rực rỡ)
    // 11: Tomato (Ca 5 - Tối tập trung)
    let autoColorId = '9'; // Mặc định Blueberry nếu không tìm ra ca
    if (item.subjectName.includes('[Ca 1]')) autoColorId = '1';
    else if (item.subjectName.includes('[Ca 2]')) autoColorId = '2';
    else if (item.subjectName.includes('[Ca 3]')) autoColorId = '5';
    else if (item.subjectName.includes('[Ca 4]')) autoColorId = '6';
    else if (item.subjectName.includes('[Ca 5]')) autoColorId = '11';

    // Ưu tiên colorId người dùng tự thiết lập trong SubjectSetting (nếu có), nếu không dùng autoColorId
    const finalColorId = subjectSetting?.colorId || autoColorId;

    const eventParams = {
      summary: item.subjectName,
      location: item.room || '',
      description: `Mã LHP: ${item.maLopHocPhan}\nGiảng viên: ${item.lecturer || 'N/A'}\n${item.note}`,
      start: { 
        dateTime: item.startTime,
        timeZone: 'Asia/Ho_Chi_Minh'
      },
      end: { 
        dateTime: item.endTime,
        timeZone: 'Asia/Ho_Chi_Minh'
      },
      colorId: finalColorId, // Áp dụng màu tự động theo ca
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: subjectSetting?.reminderMinutes || 30 },
        ],
      },
    };

    try {
      // Cố gắng insert
      await calendar.events.insert({
        calendarId,
        resource: { id: eventId, ...eventParams },
      });
      added++;
    } catch (err) {
      if (err.code === 409) {
        // Sự kiện đã tồn tại -> Update
        await calendar.events.update({
          calendarId,
          eventId,
          resource: eventParams,
        });
        updated++;
      } else {
        console.error(`Lỗi đồng bộ môn ${item.subjectName}:`, err.message);
      }
    }
  }

  // Đồng bộ sự kiện cá nhân
  const customEvents = await CustomEvent.find({ isSynced: false });
  for (const ce of customEvents) {
    const eventId = getValidEventId('cust', ce._id.toString());
    
    try {
      await calendar.events.insert({
        calendarId,
        resource: {
          id: eventId,
          summary: ce.title,
          description: ce.description || '',
          start: { dateTime: ce.startTime.toISOString(), timeZone: 'Asia/Ho_Chi_Minh' },
          end: { dateTime: ce.endTime.toISOString(), timeZone: 'Asia/Ho_Chi_Minh' },
          colorId: '2', // Default màu xanh lá cho event cá nhân
        }
      });
      added++;
    } catch(err) {
      if (err.code !== 409) {
        console.error(`Lỗi thêm sự kiện cá nhân ${ce.title}:`, err.message);
      }
    }
    
    ce.isSynced = true;
    await ce.save();
  }

  return { added, updated };
};
