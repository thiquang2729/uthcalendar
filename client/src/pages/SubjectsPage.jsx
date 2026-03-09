import { useState, useEffect } from 'react';
import api from '../services/api';

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchEvents();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubject = async (code, updates) => {
    try {
      await api.put(`/subjects/${code}`, updates);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await api.post('/events', eventForm);
      setEventForm({ title: '', description: '', startTime: '', endTime: '' });
      setMessage('Thêm sự kiện thành công!');
      fetchEvents();
    } catch (err) {
      setMessage('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const colorOptions = [
    { id: '1', label: 'Xanh lavender' },
    { id: '2', label: 'Xanh lá' },
    { id: '3', label: 'Tím' },
    { id: '4', label: 'Hồng' },
    { id: '5', label: 'Vàng' },
    { id: '6', label: 'Cam' },
    { id: '7', label: 'Xanh ngọc' },
    { id: '8', label: 'Xám' },
    { id: '9', label: 'Xanh đậm' },
    { id: '10', label: 'Xanh lục' },
    { id: '11', label: 'Đỏ' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Quản lý Môn học & Sự kiện
      </h2>

      {/* Subjects Table */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          📚 Danh sách Môn học
        </h3>

        {subjects.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Chưa có môn học nào. Chạy đồng bộ để lấy danh sách từ UTH.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Mã</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Tên môn</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Màu</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Nhắc nhở</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Bỏ qua</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.subjectCode} style={{
                    borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                    opacity: s.isIgnored ? 0.5 : 1,
                  }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{s.subjectCode}</td>
                    <td style={{ padding: '10px 12px' }}>{s.subjectName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <select
                        className="input-field"
                        value={s.colorId}
                        onChange={(e) => handleUpdateSubject(s.subjectCode, { colorId: e.target.value })}
                        style={{ width: '140px', padding: '6px 8px' }}
                      >
                        {colorOptions.map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <input
                        type="number"
                        className="input-field"
                        value={s.reminderMinutes}
                        min={0}
                        onChange={(e) => handleUpdateSubject(s.subjectCode, { reminderMinutes: Number(e.target.value) })}
                        style={{ width: '80px', padding: '6px 8px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <label style={{ cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={s.isIgnored}
                          onChange={(e) => handleUpdateSubject(s.subjectCode, { isIgnored: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                        />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Event */}
      <div className="card" style={{ maxWidth: '600px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          ➕ Thêm sự kiện cá nhân
        </h3>
        <form onSubmit={handleAddEvent}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Tiêu đề
              </label>
              <input
                id="event-title"
                className="input-field"
                placeholder="VD: Họp nhóm đồ án"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Mô tả
              </label>
              <textarea
                id="event-description"
                className="input-field"
                rows={3}
                placeholder="Mô tả chi tiết..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Bắt đầu
                </label>
                <input
                  id="event-start"
                  type="datetime-local"
                  className="input-field"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Kết thúc
                </label>
                <input
                  id="event-end"
                  type="datetime-local"
                  className="input-field"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            {message && (
              <p style={{
                fontSize: '13px',
                color: message.includes('Lỗi') ? 'var(--color-danger)' : 'var(--color-success)',
              }}>
                {message}
              </p>
            )}

            <button id="add-event-btn" type="submit" className="btn-primary">
              Thêm sự kiện
            </button>
          </div>
        </form>

        {/* Events list */}
        {events.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--color-text-muted)' }}>
              Sự kiện đã tạo
            </h4>
            {events.map((ev) => (
              <div key={ev._id} style={{
                padding: '12px',
                background: 'var(--color-surface)',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '14px' }}>{ev.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    {new Date(ev.startTime).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`badge ${ev.isSynced ? 'badge-success' : 'badge-danger'}`}>
                  {ev.isSynced ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectsPage;
