import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Phone, Mail } from 'lucide-react';
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
    <div className="pickup-page">
      <div className="pickup-header">
        <div className="pickup-header-left">
          <button className="back-btn" onClick={() => navigate('/admin/pickup-stations')}>
            <ArrowLeft size={18} /> Back to Stations
          </button>
          <h2>Create Pickup Station</h2>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <form onSubmit={handleSubmit} className="pickup-form">
        <div className="pickup-form-grid">
          <div className="form-group">
            <label className="form-label">Station Name <span className="required">*</span></label>
            <div className="input-icon-wrapper">
              <MapPin size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input with-icon"
                placeholder="e.g., Nairobi CBD Station"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">County <span className="required">*</span></label>
            <input
              type="text"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Nairobi"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Town <span className="required">*</span></label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Nairobi CBD"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-icon-wrapper">
              <Phone size={18} className="input-icon" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input with-icon"
                placeholder="e.g., 0712345678"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Address <span className="required">*</span></label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea"
              rows={3}
              placeholder="Full physical address"
              required
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input with-icon"
                placeholder="station@example.com"
              />
            </div>
          </div>

          <div className="form-group checkbox-group full-width">
            <label className="form-checkbox">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
            <span className="checkbox-hint">Station will be available for customer pickup</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : <><Save size={18} /> Create Station</>}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/pickup-stations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}