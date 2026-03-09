import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function DashboardPage() {
  const [settings, setSettings] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [logLines, setLogLines] = useState([]);
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
        {/* Google Status */}
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Google Calendar
          </p>
          <span className={`badge ${settings?.googleConfig?.isConnected ? 'badge-success' : 'badge-danger'}`}>
            {settings?.googleConfig?.isConnected ? '✓ Đã liên kết' : '✗ Chưa liên kết'}
          </span>
        </div>

        {/* UTH Status */}
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Tài khoản UTH
          </p>
          <span className={`badge ${settings?.uthConfig?.studentId ? 'badge-success' : 'badge-danger'}`}>
            {settings?.uthConfig?.studentId || 'Chưa cấu hình'}
          </span>
        </div>

        {/* Automation */}
        <div className="card">
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Tự động hóa
          </p>
          <span className="badge badge-success">
            {settings?.automationConfig?.cronSchedule || 'Chưa đặt'}
          </span>
        </div>
      </div>

      {/* Sync Button */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <button
          id="sync-now-btn"
          className="btn-primary"
          onClick={handleSync}
          disabled={syncing}
          style={{
            padding: '16px 48px',
            fontSize: '16px',
            borderRadius: '12px',
          }}
        >
          {syncing ? '⏳ Đang đồng bộ...' : '🔄 Đồng bộ ngay'}
        </button>
      </div>

      {/* Terminal */}
      <div className="terminal" ref={terminalRef}>
        <div style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          $ uth-calendar-sync
        </div>
        {logLines.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)' }}>
            Nhấn "Đồng bộ ngay" để bắt đầu...
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
