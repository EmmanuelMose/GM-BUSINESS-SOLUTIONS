import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pickupStationsAPI } from '../../../../Features/pickupStations/pickupStationsAPI';
import './CreatePickupStation.css';

export default function CreatePickupStation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    county: '',
    town: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await pickupStationsAPI.createStation(formData);
      if (res.success) {
        setSuccess('Pickup station created successfully!');
        setTimeout(() => navigate('/admin/pickup-stations'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create pickup station');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Create Pickup Station</h2>
        <button className="btn-secondary" onClick={() => navigate('/admin/pickup-stations')}>
          Back to Stations
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="station-form">
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Station Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">County *</label>
            <input type="text" name="county" value={formData.county} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Town *</label>
            <input type="text" name="town" value={formData.town} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className="form-textarea" rows={2} required />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group checkbox-group full-width">
            <label className="form-checkbox">
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Active
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Station'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/pickup-stations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}