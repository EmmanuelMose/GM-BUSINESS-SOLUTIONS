import { useState, useEffect, useMemo } from 'react';
import { Search, Edit, Trash2, Power,  Calendar, X } from 'lucide-react';
import { usersAPI, type User } from '../../../../Features/users/usersAPI';
import './ManageUsers.css';

type RoleFilter = 'all' | 'customer' | 'admin' | 'staff';
type StatusFilter = 'all' | 'active' | 'inactive';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll();
      if (res.success) setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.isActive === (statusFilter === 'active'));
    }
    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setActionLoading(id);
    try {
      const res = await usersAPI.toggleStatus(id);
      if (res.success) {
        setUsers(users.map(u => u.userId === id ? { ...u, isActive: !currentStatus } : u));
        showToast('success', `User ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        showToast('error', 'Failed to toggle status');
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
      showToast('error', error.message || 'Failed to toggle status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setActionLoading(id);
    try {
      const res = await usersAPI.delete(id);
      if (res.success) {
        setUsers(users.filter(u => u.userId !== id));
        showToast('success', 'User deleted successfully');
      } else {
        showToast('error', 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToast('error', error.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await usersAPI.update(editingUser.userId, editFormData);
      if (res.success) {
        setUsers(users.map(u => u.userId === editingUser.userId ? { ...u, ...editFormData } : u));
        showToast('success', 'User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        showToast('error', 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      showToast('error', error.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      customer: 'role-customer',
      admin: 'role-admin',
      staff: 'role-staff',
    };
    return classes[role] || 'role-customer';
  };

  if (loading) {
    return (
      <div className="manage-loading">
        <div className="manage-loader"></div>
        <p>Loading users...</p>
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
          <h2>Manage Users</h2>
          <p className="manage-subtitle">View and manage all registered users</p>
        </div>
        <div className="manage-header-actions">
          <span className="user-count">{users.length} total users</span>
        </div>
      </div>

      <div className="manage-filters">
        <div className="manage-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="manage-filter-group">
          <div className="manage-filter">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="manage-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="manage-table-container">
        <table className="manage-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="manage-empty">
                  <span>👤</span>
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId} className={user.isActive ? '' : 'inactive-row'}>
                  <td className="user-name">{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString('en-KE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                  <td className="manage-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditClick(user)}
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => handleToggleStatus(user.userId, user.isActive)}
                      disabled={actionLoading === user.userId}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user.userId)}
                      disabled={actionLoading === user.userId}
                      title="Delete User"
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

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleEditSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}