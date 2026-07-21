import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminDrawer from './aside/AdminDrawer';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <AdminDrawer isOpen={isDrawerOpen} onToggle={toggleDrawer} />
        <main className={`admin-content ${isDrawerOpen ? 'expanded' : 'collapsed'}`}>
          <div className="admin-header">
            <button onClick={toggleDrawer} className="admin-toggle-btn">
              {isDrawerOpen ? '◀' : '▶'}
            </button>
            <h1 className="admin-title">Admin Dashboard</h1>
          </div>
          <div className="admin-outlet">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}