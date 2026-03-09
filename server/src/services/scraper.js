const Setting = require('../models/Setting');
const SubjectSetting = require('../models/SubjectSetting');
const CryptoJS = require('crypto-js');

const UTH_API_BASE = 'https://portal.ut.edu.vn/api/v1';

const fetchOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
};

/**
 * Đăng nhập vào cổng UTH và lấy Bearer token
 */
const loginUTH = async (studentId, decryptedPassword) => {
  const res = await fetch(`${UTH_API_BASE}/user/login`, {
    ...fetchOptions,
    method: 'POST',
    body: JSON.stringify({
      username: studentId,
      password: decryptedPassword,
    }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error(`[Login] Status: ${res.status}, Text: '${text}'`);
    throw new Error('API UTH phản hồi lỗi không xác định (không phải JSON)');
  }

  if (!data.success || !data.token) {
    throw new Error('Đăng nhập UTH thất bại: ' + (data.message || 'Sai tài khoản hoặc mật khẩu'));
  }

  return data.token;
};

/**
 * Lấy lịch học tuần từ UTH API
 */
const fetchWeekSchedule = async (token, date) => {
  // Thử dùng POST với payload json (Nhiều API custom dùng POST cho query)
  // Nếu portal hiện tại yêu cầu GET, ta sửa lại sau.
  const res = await fetch(`${UTH_API_BASE}/lichhoc/lichTuan?date=${date}`, {
    method: 'GET', // Trả lại thành GET
    headers: {
      ...fetchOptions.headers,
      'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error(`[Lịch tuần] Status: ${res.status}, Text length: ${text.length}, Text: '${text}'`);
    throw new Error(`API lịch học phản hồi không đúng (${res.status})`);
  }

  if (!data.success) {
    throw new Error('Lỗi lấy lịch học: ' + (data.message || 'Không rõ'));
  }

  return data.body || [];
};

/**
 * Xác định ca học dựa trên giờ bắt đầu và kết thúc
 */
const getCaHoc = (tuGio, denGio) => {
  const timeStr = `${tuGio} - ${denGio}`;
  if (timeStr === '06:45 - 09:15') return 'Ca 1';
  if (timeStr === '09:25 - 11:55') return 'Ca 2';
  if (timeStr === '12:10 - 14:40') return 'Ca 3';
  if (timeStr === '14:50 - 17:20') return 'Ca 4';
  if (timeStr === '17:30 - 20:00') return 'Ca 5';
  return ''; // Không xác định được
};

/**
 * Chuyển đổi dữ liệu UTH thành format sự kiện cho Google Calendar
 * @param {Array} rawSchedule - Dữ liệu thô từ API UTH
 * @returns {Array} Mảng sự kiện đã chuẩn hóa
 */
const transformScheduleData = (rawSchedule) => {
  return rawSchedule
    .filter((item) => !item.isTamNgung) // Bỏ qua môn tạm ngưng
    .map((item) => {
      // Chuyển ngày từ "dd/MM/yyyy" sang "yyyy-MM-dd"
      const [day, month, year] = item.ngayBatDauHoc.split('/');
      const dateStr = `${year}-${month}-${day}`;

      // Tạo datetime ISO
      const startDateTime = `${dateStr}T${item.tuGio}:00`;
      const endDateTime = `${dateStr}T${item.denGio}:00`;
      
      // Lấy thông tin ca học
      const caHoc = getCaHoc(item.tuGio, item.denGio);
      const subjectNameWithCa = caHoc ? `[${caHoc}] ${item.tenMonHoc}` : item.tenMonHoc;

      return {
        id: item.id,
        subjectCode: item.maMonHoc,
        subjectName: subjectNameWithCa,
        maLopHocPhan: item.maLopHocPhan,
        room: item.tenPhong,
        campus: item.coSoToDisplay,
        startTime: startDateTime,
        endTime: endDateTime,
        dayOfWeek: item.thu,
        lecturer: item.giangVien || '',
        link: item.link || '',
        note: (item.ghiChu || '').trim(),
      };
    });
};

/**
 * Cào dữ liệu lịch học và cập nhật danh sách môn học
 * @param {string} [dateStr] - Ngày cần lấy (mặc định: hôm nay)
 * @returns {Array} Mảng sự kiện đã chuẩn hóa
 */
exports.scrapeSchedule = async (dateStr) => {
  const setting = await Setting.findOne();
  if (!setting) throw new Error('Chưa có cấu hình hệ thống');

  const { studentId, password } = setting.uthConfig;
  if (!studentId || !password) {
    throw new Error('Thiếu thông tin cấu hình UTH (studentId, password)');
  }

  // Giải mã mật khẩu
  const decryptedPassword = CryptoJS.AES.decrypt(password, process.env.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);

  // Đăng nhập
  const token = await loginUTH(studentId, decryptedPassword);

  // Lấy lịch tuần
  const date = dateStr || new Date().toISOString().split('T')[0];
  const rawSchedule = await fetchWeekSchedule(token, date);

  // Chuyển đổi dữ liệu
  const events = transformScheduleData(rawSchedule);

  // Tự động cập nhật danh sách môn học vào DB
  const uniqueSubjects = new Map();
  events.forEach((e) => {
    if (!uniqueSubjects.has(e.subjectCode)) {
      uniqueSubjects.set(e.subjectCode, e.subjectName);
    }
  });

  for (const [code, name] of uniqueSubjects) {
    await SubjectSetting.findOneAndUpdate(
      { subjectCode: code },
      { $setOnInsert: { subjectCode: code, subjectName: name } },
      { upsert: true }
    );
  }

  return events;
};

exports.loginUTH = loginUTH;
exports.fetchWeekSchedule = fetchWeekSchedule;
