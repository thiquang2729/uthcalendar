import { NavLink, useNavigate } from 'react-router-dom';

const menuItems = [
  { path: '/', label: 'Tổng quan', icon: '📊' },
  { path: '/uth-config', label: 'Cấu hình UTH', icon: '🎓' },
  { path: '/calendar-config', label: 'Lịch & Tự động', icon: '📅' },
  { path: '/subjects', label: 'Môn học & Sự kiện', icon: '📚' },
  { path: '/logs', label: 'Nhật ký', icon: '📋' },
];

function Sidebar() {
  const navigate = useNavigate();

  // Mở rộng phần logout để hiển thị Username
  const username = localStorage.getItem('username') || 'Sinh viên';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <aside className="glass" style={{
      width: '260px',
      minHeight: '100vh',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px', marginBottom: '40px' }}>
        <h1 className="gradient-text" style={{ fontSize: '20px', fontWeight: 700 }}>
          UTH Calendar
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Đồng bộ lịch học tự động
        </p>
      </div>

      {/* Menu */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              transition: 'all 0.2s',
            })}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        marginTop: 'auto',
        padding: '16px 12px',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
          }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {username}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Học viên</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            width: '100%',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <span style={{ fontSize: '14px' }}>🚪</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
