import { useState, useEffect } from 'react';
import { couponsAPI, type Coupon } from '../../../../Features/coupons/couponsAPI';
import './Coupons.css';

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const res = await couponsAPI.getAll();
        if (res.success) setCoupons(res.data);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading coupons...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Coupons</h2>
        <button className="btn-primary">Add Coupon</button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Used</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state">No coupons found</td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.couponId}>
                  <td className="coupon-code">{coupon.code}</td>
                  <td>{coupon.description || 'N/A'}</td>
                  <td>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `KSh ${coupon.discountValue}`}
                  </td>
                  <td>{coupon.usedCount} / {coupon.usageLimit || '∞'}</td>
                  <td>{coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <span className={`status-badge ${coupon.isActive ? 'status-active' : 'status-inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit">✏️</button>
                    <button className="action-btn delete">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}