import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, X, Calendar } from 'lucide-react';
import { staffAPI, type Staff } from '../../../../Features/staff/staffAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './ManageStaff.css';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function ManageStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [] = useState<StatusFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEmail, setSelectedEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      showToast('error', 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredStaff = useMemo(() => {
    let filtered = staff;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [staff, searchQuery]);

  const handleAddStaff = async () => {
    if (!selectedUser || !selectedEmail) return;
    setSubmitting(true);
    try {
      const res = await staffAPI.create({ userId: parseInt(selectedUser), email: selectedEmail });
      if (res.success) {
        setStaff([...staff, res.data]);
        setShowAddModal(false);
        setSelectedUser('');
        setSelectedEmail('');
        showToast('success', 'Staff added successfully');
        fetchData();
      }
    } catch (error: any) {
      console.error('Error adding staff:', error);
      showToast('error', error.message || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStaff = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    setDeletingId(id);
    try {
      const res = await staffAPI.delete(id);
      if (res.success) {
        setStaff(staff.filter(s => s.staffId !== id));
        showToast('success', 'Staff removed successfully');
        fetchData();
      } else {
        showToast('error', 'Failed to remove staff');
      }
    } catch (error: any) {
      console.error('Error removing staff:', error);
      showToast('error', error.message || 'Failed to remove staff');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = users.find(u => u.userId === parseInt(userId));
    if (user) setSelectedEmail(user.email);
  };

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="manage-loader"></div>
        <p>Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="manage-page">
      {toast && (
        <div className={`manage-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="manage-header">
        <div>
          <h2>Manage Staff</h2>
          <p className="manage-subtitle">Add or remove staff members</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <div className="manage-filters">
        <div className="manage-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="manage-table-container">
        <table className="manage-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>User ID</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={4} className="manage-empty">
                  <span>👤</span>
                  <p>No staff members found</p>
                </td>
              </tr>
            ) : (
              filteredStaff.map((member) => (
                <tr key={member.staffId}>
                  <td className="staff-email">{member.email}</td>
                  <td>{member.userId || 'N/A'}</td>
                  <td>
                    <span className="date-cell">
                      <Calendar size={14} />
                      {new Date(member.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="manage-actions">
                    <button
                      className="action-btn delete"
                      onClick={() => handleRemoveStaff(member.staffId)}
                      disabled={deletingId === member.staffId}
                      title="Remove Staff"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Staff Member</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="form-select"
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
                <div className="form-group">
                  <label className="form-label">Email (Auto-filled)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={selectedEmail}
                    disabled
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleAddStaff}
                disabled={!selectedUser || submitting}
              >
                {submitting ? 'Adding...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}