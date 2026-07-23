import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, MapPin, Phone, Mail } from 'lucide-react';
import { pickupStationsAPI } from '../../../../Features/pickupStations/pickupStationsAPI';
import './EditPickupStation.css';

export default function EditPickupStation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const res = await pickupStationsAPI.getStationById(parseInt(id!));
        if (res.success) {
          const s = res.data;
          setFormData({
            name: s.name,
            county: s.county,
            town: s.town,
            address: s.address,
            phone: s.phone || '',
            email: s.email || '',
            isActive: s.isActive,
          });
        } else {
          setError('Station not found');
        }
      } catch (error) {
        console.error('Error fetching station:', error);
        setError('Failed to load pickup station');
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [id]);

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
    setSubmitting(true);

    try {
      const res = await pickupStationsAPI.updateStation(parseInt(id!), formData);
      if (res.success) {
        setSuccess('Pickup station updated successfully!');
        setTimeout(() => navigate('/admin/pickup-stations'), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update pickup station');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pickup-loading">
        <div className="pickup-loader"></div>
        <p>Loading pickup station...</p>
      </div>
    );
  }

  return (
    <div className="pickup-page">
      <div className="pickup-header">
        <div className="pickup-header-left">
          <button className="back-btn" onClick={() => navigate('/admin/pickup-stations')}>
            <ArrowLeft size={18} /> Back to Stations
          </button>
          <h2>Edit Pickup Station</h2>
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
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : <><Save size={18} /> Update Station</>}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/pickup-stations')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}