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

  const handleLogout = () => {
    localStorage.removeItem('token');
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

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 12px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.color = 'var(--color-danger)'}
        onMouseLeave={(e) => e.target.style.color = 'var(--color-text-muted)'}
      >
        <span style={{ fontSize: '18px' }}>🚪</span>
        Đăng xuất
      </button>
    </aside>
  );
}

export default Sidebar;
