import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, X, Calendar } from 'lucide-react';
import { adminsAPI } from '../../../../Features/admins/adminsAPI';
import { usersAPI } from '../../../../Features/users/usersAPI';
import './ManageAdmins.css';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState<any[]>([]);
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
      showToast('error', 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredAdmins = useMemo(() => {
    let filtered = admins;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(a =>
        a.email.toLowerCase().includes(q)
      );
    }
    // Admin status is always active (no isActive field in admin table), so filterStatus is not applicable
    return filtered;
  }, [admins, searchQuery]);

  const handleAddAdmin = async () => {
    if (!selectedUser || !selectedEmail) return;
    setSubmitting(true);
    try {
      const res = await adminsAPI.create({ userId: parseInt(selectedUser), email: selectedEmail });
      if (res.success) {
        setAdmins([...admins, res.data]);
        setShowAddModal(false);
        setSelectedUser('');
        setSelectedEmail('');
        showToast('success', 'Admin added successfully');
        fetchData();
      }
    } catch (error: any) {
      console.error('Error adding admin:', error);
      showToast('error', error.message || 'Failed to add admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    setDeletingId(id);
    try {
      const res = await adminsAPI.delete(id);
      if (res.success) {
        setAdmins(admins.filter(a => a.adminId !== id));
        showToast('success', 'Admin removed successfully');
        fetchData();
      } else {
        showToast('error', 'Failed to remove admin');
      }
    } catch (error: any) {
      console.error('Error removing admin:', error);
      showToast('error', error.message || 'Failed to remove admin');
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
        <p>Loading admins...</p>
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
          <h2>Manage Admins</h2>
          <p className="manage-subtitle">Add or remove administrators</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Admin
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
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={4} className="manage-empty">
                  <span>👤</span>
                  <p>No admins found</p>
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr key={admin.adminId}>
                  <td className="admin-email">{admin.email}</td>
                  <td>{admin.userId || 'N/A'}</td>
                  <td>
                    <span className="date-cell">
                      <Calendar size={14} />
                      {new Date(admin.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="manage-actions">
                    <button
                      className="action-btn delete"
                      onClick={() => handleRemoveAdmin(admin.adminId)}
                      disabled={deletingId === admin.adminId}
                      title="Remove Admin"
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
              <h3>Add Admin</h3>
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
                onClick={handleAddAdmin}
                disabled={!selectedUser || submitting}
              >
                {submitting ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}