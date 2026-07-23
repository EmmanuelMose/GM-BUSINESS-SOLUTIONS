import { NavLink, useNavigate } from 'react-router-dom';
import { adminDrawerData, type DrawerItem } from './drawerData';
import { X } from 'lucide-react';
import './AdminDrawer.css';

interface AdminDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export default function AdminDrawer({ isOpen, onToggle, isMobile = false }: AdminDrawerProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <>
      {isMobile && isOpen && (
        <div className="admin-overlay" onClick={onToggle} />
      )}
      <aside className={`admin-drawer ${isOpen ? 'open' : 'closed'} ${isMobile ? 'mobile' : ''}`}>
        <div className="drawer-header">
          <span className={`drawer-logo ${isOpen ? 'visible' : 'hidden'}`}>
            GMNEX<span className="logo-dot">.</span>
          </span>
          {isMobile && (
            <button onClick={onToggle} className="drawer-close">
              <X size={24} />
            </button>
          )}
          {!isMobile && (
            <button onClick={onToggle} className="drawer-toggle">
              {isOpen ? '◀' : '▶'}
            </button>
          )}
        </div>
        <nav className="drawer-nav">
          {adminDrawerData.map((item: DrawerItem) => {
            if (item.id === 'logout') {
              return (
                <button
                  key={item.id}
                  onClick={handleLogout}
                  className="drawer-item logout"
                >
                  <span className="drawer-icon">{item.icon}</span>
                  {isOpen && <span className="drawer-label">{item.name}</span>}
                </button>
              );
            }
            return (
              <NavLink
                key={item.id}
                to={item.link}
                className={({ isActive }) =>
                  `drawer-item ${isActive ? 'active' : ''}`
                }
                onClick={() => {
                  if (isMobile) onToggle();
                }}
              >
                <span className="drawer-icon">{item.icon}</span>
                {isOpen && <span className="drawer-label">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
        <div className={`drawer-footer ${isOpen ? 'visible' : 'hidden'}`}>
          <p>© {new Date().getFullYear()} GMNEX</p>
          <p className="drawer-version">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}