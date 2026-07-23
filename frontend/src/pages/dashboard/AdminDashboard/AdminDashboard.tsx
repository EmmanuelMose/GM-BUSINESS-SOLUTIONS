import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminDrawer from './aside/AdminDrawer';
import { Menu, X } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsDrawerOpen(false);
      } else {
        setIsDrawerOpen(true);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDrawer = () => {
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsDrawerOpen(!isDrawerOpen);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-mobile-header">
          <button onClick={toggleDrawer} className="admin-mobile-menu-btn">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="admin-mobile-logo">GMNEX</span>
          <button onClick={handleLogout} className="admin-mobile-logout">
            Logout
          </button>
        </div>
        <AdminDrawer 
          isOpen={isMobile ? isMobileMenuOpen : isDrawerOpen} 
          onToggle={toggleDrawer} 
        />
        <main className={`admin-content ${isDrawerOpen ? 'expanded' : 'collapsed'}`}>
          <div className="admin-header">
            <button onClick={toggleDrawer} className="admin-toggle-btn">
              {isDrawerOpen ? '◀' : '▶'}
            </button>
            <h1 className="admin-title">Admin Dashboard</h1>
            <button onClick={handleLogout} className="admin-logout-btn">Logout</button>
          </div>
          <div className="admin-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}