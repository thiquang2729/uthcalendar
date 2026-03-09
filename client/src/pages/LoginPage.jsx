import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function LoginPage() {
  const [isLoginHovered, setIsLoginHovered] = useState(true);
  const [formType, setFormType] = useState('login'); // 'login' hoặc 'register'
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formType === 'login') {
        const res = await api.post('/auth/login', formData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        navigate('/');
      } else {
        const res = await api.post('/auth/register', formData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
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
        maxWidth: '430px',
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
            Hệ thống quản lý lịch học dành cho sinh viên
          </p>
        </div>

        {/* Form Selection Tabs */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '8px', 
          marginBottom: '24px',
          padding: '4px'
        }}>
          <button
            onClick={() => { setFormType('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: formType === 'login' ? 'var(--color-primary)' : 'transparent',
              color: formType === 'login' ? '#fff' : 'var(--color-text-muted)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setFormType('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              background: formType === 'register' ? 'var(--color-primary)' : 'transparent',
              color: formType === 'register' ? '#fff' : 'var(--color-text-muted)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            Đăng ký
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Tên tài khoản
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Nhập username..."
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
               Mật khẩu
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Nhập mật khẩu..."
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
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
            type="submit"
            className="btn-primary"
            disabled={loading || !formData.password || !formData.username}
            style={{ width: '100%' }}
          >
            {loading ? 'Đang xử lý...' : (formType === 'login' ? 'Đăng nhập' : 'Tạo tài khoản mới')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
