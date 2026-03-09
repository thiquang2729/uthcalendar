import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    }}>
      <div className="glass" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        borderRadius: '16px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📅</div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: 700 }}>
            UTH Calendar Sync
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            Đồng bộ lịch học tự động lên Google Calendar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <input
              id="admin-password"
              type="password"
              className="input-field"
              placeholder="Nhập mật khẩu Admin..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          {error && (
            <p style={{
              color: 'var(--color-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </p>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn-primary"
            disabled={loading || !password}
            style={{ width: '100%' }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          marginTop: '24px',
        }}>
          Mật khẩu mặc định: <code style={{ color: 'var(--color-accent)' }}>admin</code>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
