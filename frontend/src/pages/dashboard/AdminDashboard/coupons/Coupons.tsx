import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Power, Search, Filter, X } from 'lucide-react';
import { couponsAPI, type Coupon } from '../../../../Features/coupons/couponsAPI';
import './Coupons.css';

type FormData = {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const defaultFormData: FormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 0,
  minOrderAmount: null,
  maxDiscount: null,
  usageLimit: null,
  perUserLimit: null,
  startDate: '',
  endDate: '',
  isActive: true,
};

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...defaultFormData });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponsAPI.getAll();
      if (res.success) setCoupons(res.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showToast('error', 'Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredCoupons = useMemo(() => {
    let filtered = coupons;
    if (filterStatus === 'active') filtered = filtered.filter(c => c.isActive);
    if (filterStatus === 'inactive') filtered = filtered.filter(c => !c.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [coupons, filterStatus, searchQuery]);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.couponId);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        minOrderAmount: coupon.minOrderAmount ? parseFloat(coupon.minOrderAmount) : null,
        maxDiscount: coupon.maxDiscount ? parseFloat(coupon.maxDiscount) : null,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
        startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
        endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
        isActive: coupon.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ ...defaultFormData });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({ ...defaultFormData });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const num = value === '' ? null : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [name]: num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!formData.code.trim() || formData.discountValue <= 0) {
        showToast('error', 'Code and discount value are required');
        setSubmitting(false);
        return;
      }

      // Convert date strings to ISO format strings
      const startDateStr = formData.startDate ? `${formData.startDate}T00:00:00.000Z` : new Date().toISOString();
      const endDateStr = formData.endDate ? `${formData.endDate}T23:59:59.999Z` : null;

      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description || null,
        discountType: formData.discountType,
        discountValue: formData.discountValue.toString(),
        minOrderAmount: formData.minOrderAmount !== null ? formData.minOrderAmount.toString() : null,
        maxDiscount: formData.maxDiscount !== null ? formData.maxDiscount.toString() : null,
        usageLimit: formData.usageLimit,
        perUserLimit: formData.perUserLimit,
        startDate: startDateStr,
        endDate: endDateStr,
        isActive: formData.isActive,
        appliesTo: null,
      };

      console.log('🚀 Sending coupon payload:', payload);

      let res;
      if (editingId) {
        res = await couponsAPI.update(editingId, payload);
      } else {
        res = await couponsAPI.create(payload);
      }

      if (res.success) {
        showToast('success', editingId ? 'Coupon updated successfully' : 'Coupon created successfully');
        fetchCoupons();
        closeModal();
      } else {
        showToast('error', 'Operation failed');
      }
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
        showToast('error', error.response.data?.message || JSON.stringify(error.response.data) || 'Server error');
      } else {
        showToast('error', error.message || 'An error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await couponsAPI.delete(id);
      if (res.success) {
        showToast('success', 'Coupon deleted');
        setCoupons(coupons.filter(c => c.couponId !== id));
      } else {
        showToast('error', 'Failed to delete coupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast('error', 'An error occurred');
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const res = await couponsAPI.toggleStatus(id);
      if (res.success) {
        setCoupons(coupons.map(c => c.couponId === id ? { ...c, isActive: !currentStatus } : c));
        showToast('success', `Coupon ${!currentStatus ? 'activated' : 'deactivated'}`);
      } else {
        showToast('error', 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('error', 'An error occurred');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    const value = parseFloat(coupon.discountValue);
    return coupon.discountType === 'percentage' ? `${value}%` : `KSh ${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="coupons-loading">
        <div className="coupons-loader"></div>
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="coupons-page">
      {toast && (
        <div className={`coupons-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="coupons-header">
        <div>
          <h2>Coupons</h2>
          <p className="coupons-subtitle">Manage promotional coupons and discounts</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Create Coupon
        </button>
      </div>

      <div className="coupons-filters">
        <div className="coupons-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="coupons-filter">
          <Filter size={16} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="coupons-table-container">
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Used / Limit</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="coupons-empty">
                  <span>🏷️</span>
                  <p>No coupons found</p>
                  <button className="btn-primary btn-sm" onClick={() => openModal()}>Create your first coupon</button>
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => (
                <tr key={coupon.couponId} className={coupon.isActive ? '' : 'inactive-row'}>
                  <td className="coupon-code">{coupon.code}</td>
                  <td>{coupon.description || '—'}</td>
                  <td className="coupon-discount">{getDiscountDisplay(coupon)}</td>
                  <td>{coupon.usedCount} / {coupon.usageLimit ?? '∞'}</td>
                  <td>{formatDate(coupon.endDate)}</td>
                  <td>
                    <span className={`status-badge ${coupon.isActive ? 'status-active' : 'status-inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="coupon-actions">
                    <button className="action-btn edit" onClick={() => openModal(coupon)} title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => handleToggleStatus(coupon.couponId, coupon.isActive)}
                      title={coupon.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(coupon.couponId)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Coupon Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., SAVE20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select name="discountType" value={formData.discountType} onChange={handleChange}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (KSh)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleNumberChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Minimum Order (KSh)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount ?? ''}
                    onChange={handleNumberChange}
                    min="0"
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Maximum Discount (KSh)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount ?? ''}
                    onChange={handleNumberChange}
                    min="0"
                    placeholder="Optional"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Usage Limit (total)</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit ?? ''}
                    onChange={handleNumberChange}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Per User Limit</label>
                  <input
                    type="number"
                    name="perUserLimit"
                    value={formData.perUserLimit ?? ''}
                    onChange={handleNumberChange}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group full-width checkbox-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingId ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}