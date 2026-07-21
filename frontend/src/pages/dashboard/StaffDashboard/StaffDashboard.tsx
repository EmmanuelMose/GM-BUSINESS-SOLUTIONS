import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StaffDrawer from './aside/StaffDrawer';
import './StaffDashboard.css';

export default function StaffDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="staff-dashboard">
      <div className="staff-container">
        <StaffDrawer isOpen={isDrawerOpen} onToggle={toggleDrawer} />
        <main className={`staff-content ${isDrawerOpen ? 'expanded' : 'collapsed'}`}>
          <div className="staff-header">
            <button onClick={toggleDrawer} className="staff-toggle-btn">
              {isDrawerOpen ? '◀' : '▶'}
            </button>
            <h1 className="staff-title">Staff Dashboard</h1>
          </div>
          <div className="staff-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}