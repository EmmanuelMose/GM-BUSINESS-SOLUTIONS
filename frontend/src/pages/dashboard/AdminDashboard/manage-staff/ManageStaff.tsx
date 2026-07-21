import { useState, useEffect } from 'react';
import { staffAPI, type Staff } from '../../../../Features/staff/staffAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './ManageStaff.css';

export default function ManageStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [staffRes, usersRes] = await Promise.all([
          staffAPI.getAll(),
          usersAPI.getAll(),
        ]);
        if (staffRes.success) setStaff(staffRes.data);
        if (usersRes.success) {
          const staffUserIds = staffRes.data.map((s: any) => s.userId);
          setUsers(usersRes.data.filter((u: any) => !staffUserIds.includes(u.userId) && u.role !== 'admin'));
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStaff = async () => {
    if (!selectedUser || !selectedEmail) return;
    try {
      const res = await staffAPI.create({ userId: parseInt(selectedUser), email: selectedEmail });
      if (res.success) {
        setStaff([...staff, res.data]);
        setShowAddModal(false);
        setSelectedUser('');
        setSelectedEmail('');
      }
    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  const handleRemoveStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      const res = await staffAPI.delete(id);
      if (res.success) {
        setStaff(staff.filter(s => s.staffId !== id));
      }
    } catch (error) {
      console.error('Error removing staff:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = users.find(u => u.userId === parseInt(userId));
    if (user) setSelectedEmail(user.email);
  };

  if (loading) {
    return <div className="page-loading">Loading staff...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Manage Staff</h2>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>Add Staff</button>
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
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">No staff members found</td>
              </tr>
            ) : (
              staff.map((member) => (
                <tr key={member.staffId}>
                  <td className="staff-email">{member.email}</td>
                  <td>{member.userId || 'N/A'}</td>
                  <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="action-btn delete" onClick={() => handleRemoveStaff(member.staffId)}>🗑️</button>
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
            <h3>Add Staff Member</h3>
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
              <button className="btn-primary" onClick={handleAddStaff} disabled={!selectedUser}>Add Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}