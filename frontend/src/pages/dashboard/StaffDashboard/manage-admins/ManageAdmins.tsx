import { useState, useEffect } from 'react';
import { adminsAPI } from '../../../../Features/admins/adminsAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './ManageAdmins.css';

export default function StaffManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [adminsRes, usersRes] = await Promise.all([
          adminsAPI.getAll(),
          usersAPI.getAll(),
        ]);
        if (adminsRes.success) setAdmins(adminsRes.data);
        if (usersRes.success) {
          const adminUserIds = adminsRes.data.map((a: any) => a.userId);
          setUsers(usersRes.data.filter((u: any) => !adminUserIds.includes(u.userId) && u.role !== 'admin'));
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddAdmin = async () => {
    if (!selectedUser || !selectedEmail) return;
    try {
      const res = await adminsAPI.create({ userId: parseInt(selectedUser), email: selectedEmail });
      if (res.success) {
        setAdmins([...admins, res.data]);
        setShowAddModal(false);
        setSelectedUser('');
        setSelectedEmail('');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      const res = await adminsAPI.delete(id);
      if (res.success) {
        setAdmins(admins.filter(a => a.adminId !== id));
      }
    } catch (error) {
      console.error('Error removing admin:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = users.find(u => u.userId === parseInt(userId));
    if (user) setSelectedEmail(user.email);
  };

  if (loading) {
    return <div className="page-loading">Loading admins...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Manage Admins</h2>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>Add Admin</button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>User ID</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No admins found</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.adminId}>
                  <td className="admin-email">{admin.email}</td>
                  <td>{admin.userId || 'N/A'}</td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="action-btn delete" onClick={() => handleRemoveAdmin(admin.adminId)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Admin</h3>
            <div className="modal-body">
              <div className="auth-field">
                <label className="auth-label">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="filter-select"
                  style={{ width: '100%' }}
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              {selectedEmail && (
                <div className="auth-field">
                  <label className="auth-label">Email (Auto-filled)</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={selectedEmail}
                    disabled
                    style={{ background: 'var(--gray-50)' }}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddAdmin} disabled={!selectedUser}>Add Admin</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}