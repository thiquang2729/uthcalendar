import { useState, useEffect } from 'react';
import api from '../services/api';

function UthConfigPage() {
  const [form, setForm] = useState({
    studentId: '',
    password: '',
    baseUrl: '',
    selectors: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      const uth = res.data.uthConfig || {};
      setForm({
        studentId: uth.studentId || '',
        password: '',
        baseUrl: uth.baseUrl || '',
        selectors: uth.selectors ? JSON.stringify(uth.selectors, null, 2) : '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let selectors = {};
      if (form.selectors) {
        selectors = JSON.parse(form.selectors);
      }

      await api.put('/settings', {
        uthConfig: {
          studentId: form.studentId,
          ...(form.password && { password: form.password }),
          baseUrl: form.baseUrl,
          selectors,
        },
      });
      setMessage('Lưu cấu hình thành công!');
      setForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Cấu hình Nguồn UTH
      </h2>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Mã sinh viên
              </label>
              <input
                id="student-id"
                className="input-field"
                placeholder="VD: 2280600XXX"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Mật khẩu UTH (để trống nếu không đổi)
              </label>
              <input
                id="uth-password"
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu mới..."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Base URL cổng thông tin
              </label>
              <input
                id="base-url"
                className="input-field"
                placeholder="https://sinhvien.uth.edu.vn"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Selectors (JSON)
              </label>
              <textarea
                id="selectors"
                className="input-field"
                rows={5}
                placeholder='{"studentIdInput": "#txtUser", "passwordInput": "#txtPass"}'
                value={form.selectors}
                onChange={(e) => setForm({ ...form, selectors: e.target.value })}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
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

            <button
              id="save-uth-btn"
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UthConfigPage;
