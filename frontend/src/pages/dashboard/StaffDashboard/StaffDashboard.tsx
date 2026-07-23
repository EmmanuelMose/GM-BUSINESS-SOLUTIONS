import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import StaffDrawer from './aside/StaffDrawer';
import { Menu, X, ArrowLeft } from 'lucide-react';
import './StaffDashboard.css';

export default function StaffDashboard() {
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
    navigate('/staff/staffdashboard');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    const titles: Record<string, string> = {
      'staffdashboard': 'Dashboard',
      'products': 'Products',
      'categories': 'Categories',
      'orders': 'Orders',
      'reviews': 'Reviews',
      'coupons': 'Coupons',
      'inquiries': 'Inquiries',
      'pickup-stations': 'Pickup Stations',
    };
    return titles[path || ''] || 'Dashboard';
  };

  const isDashboard = location.pathname === '/staff' || location.pathname === '/staff/staffdashboard';

  return (
    <div className="staff-dashboard">
      <StaffDrawer 
        isOpen={isDrawerOpen} 
        onToggle={toggleDrawer} 
        isMobile={isMobile}
        onClose={closeDrawer}
      />
      <div className="staff-main">
        <div className="staff-topbar">
          <div className="staff-topbar-left">
            <button onClick={toggleDrawer} className="staff-menu-btn">
              {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {!isDashboard && (
              <button onClick={handleBack} className="staff-back-btn">
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            )}
            <h1 className="staff-page-title">{getPageTitle()}</h1>
          </div>
          <div className="staff-topbar-right">
            <button onClick={() => { localStorage.clear(); window.location.href = '/' }} className="staff-logout-btn">
              Logout
            </button>
          </div>
        </div>
        <div className="staff-content-wrapper">
          <div className="staff-content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}