import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminDrawer from './aside/AdminDrawer';
import { Menu, X, ArrowLeft } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsDrawerOpen(false);
      } else {
        setIsDrawerOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/admindashboard');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles: Record<string, string> = {
      'admindashboard': 'Dashboard',
      'products': 'Products',
      'categories': 'Categories',
      'orders': 'Orders',
      'payments': 'Payments',
      'reviews': 'Reviews',
      'coupons': 'Coupons',
      'inquiries': 'Inquiries',
      'analytics': 'Analytics',
      'reports': 'Reports',
      'pickup-stations': 'Pickup Stations',
    };
    return titles[path || ''] || 'Dashboard';
  };

  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/admindashboard';

  return (
    <div className="admin-dashboard">
      <AdminDrawer 
        isOpen={isDrawerOpen} 
        onToggle={toggleDrawer} 
        isMobile={isMobile}
        onClose={closeDrawer}
      />
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <button onClick={toggleDrawer} className="admin-menu-btn">
              {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {!isDashboard && (
              <button onClick={handleBack} className="admin-back-btn">
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>
          <div className="admin-topbar-right">
            <button onClick={() => { localStorage.clear(); window.location.href = '/' }} className="admin-logout-btn">
              Logout
            </button>
          </div>
        </div>
        <div className="admin-content-wrapper">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}