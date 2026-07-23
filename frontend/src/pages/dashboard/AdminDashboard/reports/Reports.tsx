import { useState } from 'react';
import './Reports.css';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Reports</h2>
      </div>
      <div className="reports-container">
        <div className="report-options">
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="filter-select">
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="orders">Orders Report</option>
            <option value="users">Users Report</option>
          </select>
          <button className="btn-primary">Generate Report</button>
        </div>
        <div className="report-preview">
          <div className="report-placeholder">
            <span className="report-icon">📄</span>
            <p>Select a report type and click Generate to view</p>
          </div>
        </div>
      </div>
    </div>
  );
}