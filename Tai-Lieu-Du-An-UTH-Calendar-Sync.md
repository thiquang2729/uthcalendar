# **TÀI LIỆU DỰ ÁN: UTH TO GOOGLE CALENDAR SYNC**

## **1\. Tổng quan dự án**

Hệ thống tự động hóa việc lấy dữ liệu lịch học từ cổng thông tin trường đại học, xử lý và đồng bộ lên Google Calendar của cá nhân. Đi kèm là một trang quản trị độc lập giúp cấu hình toàn bộ hoạt động của hệ thống mà không cần can thiệp vào mã nguồn.

## **2\. Công nghệ sử dụng**

* **Backend:** Node.js, Express.js.  
* **Frontend:** React, Tailwind CSS.  
* **Cơ sở dữ liệu:** MongoDB với Mongoose.  
* **Xác thực:** JWT, bcrypt.  
* **Tác vụ ngầm:** node-cron.  
* **Cào dữ liệu:** Puppeteer hoặc Cheerio.  
* **Tích hợp bên thứ ba:** Google Calendar API, Telegram Bot API.

## **3\. Kiến trúc cơ sở dữ liệu**

Thiết kế tối giản với 4 Schema chính dùng trong Mongoose:

**3.1. Setting (Cấu hình hệ thống)**

Chỉ lưu duy nhất 1 bản ghi.

* adminPassword: Chuỗi mã hóa bcrypt.  
* uthConfig: Object chứa studentId, password (đã mã hóa đối xứng), baseUrl, selectors.  
* googleConfig: Object chứa accessToken, refreshToken, calendarId.  
* automationConfig: Object chứa cronSchedule, telegramBotToken, telegramChatId.

**3.2. SubjectSetting (Tùy chỉnh môn học)**

* subjectCode: Mã môn học.  
* subjectName: Tên môn học.  
* isIgnored: Boolean. Nếu true, hệ thống sẽ không đồng bộ môn này.  
* colorId: Mã màu của Google Calendar.  
* reminderMinutes: Số phút nhắc nhở trước khi bắt đầu.

**3.3. CustomEvent (Sự kiện cá nhân)**

* title: Tiêu đề sự kiện.  
* description: Mô tả chi tiết.  
* startTime: Thời gian bắt đầu.  
* endTime: Thời gian kết thúc.  
* isSynced: Đánh dấu đã được đẩy lên Google Calendar hay chưa.

**3.4. SyncLog (Nhật ký hệ thống)**

* runTime: Thời điểm bắt đầu chạy.  
* status: Trạng thái (Thành công, Thất bại).  
* eventsAdded: Số lượng sự kiện mới được thêm.  
* eventsUpdated: Số lượng sự kiện được cập nhật.  
* errorMessage: Lỗi ngắn gọn nếu có.  
* logLines: Mảng các chuỗi lưu lại chi tiết tiến trình (ví dụ: "Đang đăng nhập...", "Tìm thấy 5 môn...").

## **4\. Danh sách API Backend**

Toàn bộ API (ngoại trừ hàm đăng nhập) đều yêu cầu gửi kèm JWT trong header.

**Nhóm Xác thực & Cấu hình:**

* POST /api/auth/login: Nhận mật khẩu Admin, trả về JWT.  
* GET /api/settings: Lấy toàn bộ cấu hình hiện tại (ẩn mật khẩu UTH và Google Token).  
* PUT /api/settings: Cập nhật cấu hình (UTH, lịch trình ngầm, Telegram).

**Nhóm Google Calendar:**

* GET /api/google/auth-url: Tạo đường dẫn đăng nhập Google OAuth.  
* POST /api/google/callback: Nhận mã xác quyền từ Google và lưu token.  
* GET /api/google/calendars: Liệt kê các danh sách lịch trong tài khoản Google.

**Nhóm Tùy chỉnh môn học & Sự kiện:**

* GET /api/subjects: Lấy danh sách các môn học đã được tùy chỉnh.  
* PUT /api/subjects/:code: Cập nhật màu sắc, thời gian nhắc nhở hoặc ẩn môn học.  
* GET /api/events: Lấy danh sách sự kiện cá nhân.  
* POST /api/events: Thêm lịch trình dự án, họp nhóm.

**Nhóm Chạy tự động & Nhật ký:**

* POST /api/sync/run: Kích hoạt tiến trình đồng bộ ngay lập tức. Trả về luồng log theo thời gian thực hoặc mảng log.  
* GET /api/logs: Lấy danh sách lịch sử các lần chạy gần nhất.

## **5\. Cấu trúc Giao diện Frontend**

Sử dụng React Router để chia thành các trang sau trên bảng điều khiển:

1. **Trang Đăng nhập:** Form duy nhất nhập mật khẩu Admin.  
2. **Tổng quan:** \* Trạng thái kết nối Google.  
   * Nút "Đồng bộ ngay" cỡ lớn.  
   * Cửa sổ dòng lệnh mô phỏng hiển thị tiến trình khi bấm đồng bộ.  
3. **Cấu hình Nguồn UTH:** \* Form nhập tài khoản sinh viên.  
   * Các trường nhập Base URL và thay thế thẻ HTML chọn lọc dữ liệu.  
4. **Cấu hình Lịch & Tự động hóa:** \* Nút liên kết lại tài khoản Google.  
   * Bộ chọn giờ chạy tự động.  
   * Nhập Token Telegram nhận thông báo.  
5. **Quản lý Môn học & Cá nhân:** \* Bảng danh sách môn học lấy được từ trường, kèm nút đổi màu, nút gạt bỏ qua.  
   * Form thêm sự kiện dự án thủ công.  
6. **Nhật ký:** Bảng liệt kê các lần chạy, bấm vào để xem chi tiết lỗi.

## **6\. Luồng hoạt động của hệ thống chạy ngầm**

Khi đến giờ cấu hình trong node-cron, hoặc khi bấm nút chạy thủ công, Backend sẽ thực hiện chuẩn theo các bước:

1. Đọc tài khoản UTH từ cơ sở dữ liệu và giải mã mật khẩu.  
2. Khởi động Puppeteer/Axios truy cập trang UTH và đăng nhập.  
3. Truy cập trang thời khóa biểu, dùng các thẻ HTML cấu hình sẵn để bóc tách thành mảng dữ liệu thô.  
4. Duyệt qua mảng dữ liệu, loại bỏ các môn có trạng thái bỏ qua trong cơ sở dữ liệu.  
5. Đọc danh sách sự kiện cá nhân chưa đồng bộ. Gộp chung với lịch học vừa bóc tách.  
6. Kết nối Google Calendar API bằng token đã lưu.  
7. So sánh dữ liệu cũ và mới. Nếu môn học đổi phòng hoặc đổi giờ, gửi thông báo Telegram.  
8. Đẩy toàn bộ dữ liệu lên Google Calendar. Cập nhật màu sắc và nhắc nhở theo cài đặt.  
9. Lưu kết quả cuối cùng cùng toàn bộ tiến trình vào bộ lưu trữ nhật ký.