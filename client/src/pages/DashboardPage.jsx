import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const DAY_NAMES = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

const SUBJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function getColorForSubject(code, index) {
  return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
}

function DashboardPage() {
  const [settings, setSettings] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [logLines, setLogLines] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0]);
  const terminalRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logLines]);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Lỗi lấy cấu hình:', err);
    }
  };

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    setScheduleError('');
    try {
      const res = await api.get(`/sync/preview?date=${weekDate}`);
      setSchedule(res.data.events || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setScheduleError(msg);
      setSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setLogLines(['[Bắt đầu] Đang khởi động tiến trình đồng bộ...']);

    try {
      const res = await api.post('/sync/run');
      setLogLines(res.data.logLines || []);
    } catch (err) {
      setLogLines((prev) => [...prev, `[LỖI] ${err.response?.data?.error || err.message}`]);
    } finally {
      setSyncing(false);
    }
  };

  // Nhóm lịch theo ngày
  const scheduleByDay = {};
  const subjectCodeSet = [...new Set(schedule.map((e) => e.subjectCode))];
  schedule.forEach((event) => {
    const day = event.dayOfWeek;
    if (!scheduleByDay[day]) scheduleByDay[day] = [];
    scheduleByDay[day].push(event);
  });

  // Sắp xếp theo giờ trong mỗi ngày
  Object.values(scheduleByDay).forEach((events) => {
    events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Tổng quan
      </h2>

      {/* Status Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Google Calendar
          </p>
          <span className={`badge ${settings?.googleConfig?.isConnected ? 'badge-success' : 'badge-danger'}`}>
            {settings?.googleConfig?.isConnected ? '✓ Đã liên kết' : '✗ Chưa liên kết'}
          </span>
        </div>
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Tài khoản UTH
          </p>
          <span className={`badge ${settings?.uthConfig?.studentId ? 'badge-success' : 'badge-danger'}`}>
            {settings?.uthConfig?.studentId || 'Chưa cấu hình'}
          </span>
        </div>
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Tự động hóa
          </p>
          <span className="badge badge-success">
            {settings?.automationConfig?.cronSchedule || 'Chưa đặt'}
          </span>
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📅 Xem trước lịch học tuần</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="date"
              className="input-field"
              value={weekDate}
              onChange={(e) => setWeekDate(e.target.value)}
              style={{ width: '160px', padding: '6px 10px' }}
            />
            <button className="btn-primary" onClick={fetchSchedule} disabled={loadingSchedule}
              style={{ padding: '6px 16px', fontSize: '13px' }}>
              {loadingSchedule ? '⏳ Đang tải...' : '🔍 Lấy lịch'}
            </button>
          </div>
        </div>

        {scheduleError && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(248, 113, 113, 0.1)',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '13px',
            color: 'var(--color-danger)',
          }}>
            ⚠️ {scheduleError}
          </div>
        )}

        {schedule.length === 0 && !scheduleError && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
          }}>
            {loadingSchedule ? 'Đang tải lịch học...' : 'Nhấn "Lấy lịch" để xem trước lịch học tuần'}
          </div>
        )}

        {schedule.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[2, 3, 4, 5, 6, 7].map((day) => {
              const events = scheduleByDay[day];
              if (!events || events.length === 0) return null;

              return (
                <div key={day}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-accent)',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {DAY_NAMES[day]} — {events[0].startTime.split('T')[0]}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {events.map((event) => {
                      const colorIdx = subjectCodeSet.indexOf(event.subjectCode);
                      const color = getColorForSubject(event.subjectCode, colorIdx);
                      const startTime = event.startTime.split('T')[1]?.substring(0, 5);
                      const endTime = event.endTime.split('T')[1]?.substring(0, 5);

                      return (
                        <div key={event.id} style={{
                          display: 'flex',
                          alignItems: 'stretch',
                          background: 'var(--color-surface)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          transition: 'transform 0.15s',
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                        >
                          <div style={{ width: '4px', background: color, flexShrink: 0 }} />
                          <div style={{
                            flex: 1,
                            padding: '12px 16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '16px',
                          }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                                {event.subjectName}
                              </p>
                              <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                <span>🕐 {startTime} - {endTime}</span>
                                <span>📍 {event.room}</span>
                                {event.lecturer && <span>👤 {event.lecturer}</span>}
                              </div>
                            </div>
                            <div style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: `${color}22`,
                              color: color,
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                            }}>
                              {event.maLopHocPhan}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <p style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              marginTop: '8px',
              textAlign: 'center',
            }}>
              Tổng cộng: {schedule.length} buổi học trong tuần
            </p>
          </div>
        )}
      </div>

      {/* Sync Button */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <button
          id="sync-now-btn"
          className="btn-primary"
          onClick={handleSync}
          disabled={syncing}
          style={{ padding: '16px 48px', fontSize: '16px', borderRadius: '12px' }}
        >
          {syncing ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ lên Google Calendar'}
        </button>
      </div>

      {/* Terminal */}
      <div className="terminal" ref={terminalRef}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          $ uth-calendar-sync
        </div>
        {logLines.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)' }}>
            Nhấn "Đồng bộ" để bắt đầu...
          </div>
        ) : (
          logLines.map((line, i) => (
            <div key={i} className="log-line" style={{
              animationDelay: `${i * 0.05}s`,
              color: line.includes('LỖI') ? 'var(--color-danger)' :
                     line.includes('hoàn tất') ? 'var(--color-success)' : undefined,
            }}>
              {line}
            </div>
          ))
        )}
        {syncing && (
          <div className="log-line" style={{ animation: 'blink 1s infinite' }}>▋</div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
