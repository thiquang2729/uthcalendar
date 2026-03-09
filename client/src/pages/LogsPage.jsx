import { useState, useEffect } from 'react';
import api from '../services/api';

function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Nhật ký hệ thống
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: selectedLog ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Logs table */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-surface-lighter)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Thời gian</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Trạng thái</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Thêm</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Chưa có nhật ký nào
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log._id}
                      onClick={() => setSelectedLog(log)}
                      style={{
                        borderBottom: '1px solid rgba(148, 163, 184, 0.05)',
                        cursor: 'pointer',
                        background: selectedLog?._id === log._id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLog?._id !== log._id) e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLog?._id !== log._id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        {new Date(log.runTime).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className={`badge ${log.status === 'Thành công' ? 'badge-success' : 'badge-danger'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{log.eventsAdded}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{log.eventsUpdated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log detail */}
        {selectedLog && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Chi tiết</h3>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {new Date(selectedLog.runTime).toLocaleString('vi-VN')}
              </p>
              <span className={`badge ${selectedLog.status === 'Thành công' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                {selectedLog.status}
              </span>
            </div>

            {selectedLog.errorMessage && (
              <div style={{
                padding: '12px',
                background: 'rgba(248, 113, 113, 0.1)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                color: 'var(--color-danger)',
              }}>
                ⚠️ {selectedLog.errorMessage}
              </div>
            )}

            <div className="terminal" style={{ maxHeight: '500px' }}>
              {selectedLog.logLines?.map((line, i) => (
                <div key={i} style={{
                  padding: '2px 0',
                  color: line.includes('LỖI') ? 'var(--color-danger)' :
                         line.includes('hoàn tất') ? 'var(--color-success)' : undefined,
                }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LogsPage;
