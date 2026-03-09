import { useState, useEffect } from 'react';
import api from '../services/api';

function CalendarConfigPage() {
  const [settings, setSettings] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [form, setForm] = useState({
    cronSchedule: '',
    telegramBotToken: '',
    telegramChatId: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
    
    // Kiểm tra kết quả trả về từ Google Callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setMessage('Liên kết Google Calendar thành công!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      const errCode = params.get('error');
      setMessage(`Lỗi liên kết Google: ${errCode}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
      const auto = res.data.automationConfig || {};
      setForm({
        cronSchedule: auto.cronSchedule || '',
        telegramBotToken: auto.telegramBotToken || '',
        telegramChatId: auto.telegramChatId || '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await api.get('/google/auth-url');
      // Chuyển hướng trong cùng tab để tránh bị block popup và cookie issues
      window.location.href = res.data.url;
    } catch (err) {
      setMessage('Lỗi tạo URL xác thực: ' + err.message);
    }
  };

  const handleFetchCalendars = async () => {
    try {
      const res = await api.get('/google/calendars');
      setCalendars(res.data);
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/settings', { automationConfig: form });
      setMessage('Lưu cấu hình thành công!');
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Cấu hình Lịch & Tự động hóa
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        {/* Google Calendar */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            📅 Google Calendar
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className={`badge ${settings?.googleConfig?.isConnected ? 'badge-success' : 'badge-danger'}`}>
              {settings?.googleConfig?.isConnected ? '✓ Đã liên kết' : '✗ Chưa liên kết'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button id="google-auth-btn" className="btn-primary" onClick={handleGoogleAuth}>
              Liên kết Google
            </button>
            <button
              id="fetch-calendars-btn"
              className="btn-primary"
              onClick={handleFetchCalendars}
              style={{ background: 'var(--color-surface-lighter)' }}
            >
              Xem danh sách lịch
            </button>
          </div>

          {calendars.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Danh sách lịch:
              </p>
              {calendars.map((cal) => (
                <div key={cal.id} style={{
                  padding: '8px 12px',
                  background: 'var(--color-surface)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '4px',
                }}>
                  {cal.summary} ({cal.id})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Automation */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            ⚙️ Tự động hóa
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Lịch trình Cron
                </label>
                <input
                  id="cron-schedule"
                  className="input-field"
                  placeholder="0 6 * * * (6h sáng mỗi ngày)"
                  value={form.cronSchedule}
                  onChange={(e) => setForm({ ...form, cronSchedule: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Telegram Bot Token
                </label>
                <input
                  id="telegram-token"
                  className="input-field"
                  placeholder="123456:ABC-DEF..."
                  value={form.telegramBotToken}
                  onChange={(e) => setForm({ ...form, telegramBotToken: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Telegram Chat ID
                </label>
                <input
                  id="telegram-chat-id"
                  className="input-field"
                  placeholder="VD: 123456789"
                  value={form.telegramChatId}
                  onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
                />
              </div>

              {message && (
                <p style={{
                  fontSize: '13px',
                  color: message.includes('Lỗi') ? 'var(--color-danger)' : 'var(--color-success)',
                }}>
                  {message}
                </p>
              )}

              <button id="save-automation-btn" type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CalendarConfigPage;
