import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Power, Search, Filter, Phone, Mail } from 'lucide-react';
import { pickupStationsAPI, type PickupStation } from '../../../../Features/pickupStations/pickupStationsAPI';
import './PickupStations.css';

type StatusFilter = 'all' | 'active' | 'inactive';

export default function PickupStations() {
  const [stations, setStations] = useState<PickupStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await pickupStationsAPI.getAllStations();
      if (res.success) setStations(res.data);
    } catch (error) {
      console.error('Error fetching pickup stations:', error);
      showToast('error', 'Failed to load pickup stations');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filteredStations = useMemo(() => {
    let filtered = stations;
    if (filterStatus === 'active') filtered = filtered.filter(s => s.isActive);
    if (filterStatus === 'inactive') filtered = filtered.filter(s => !s.isActive);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.county.toLowerCase().includes(q) ||
        s.town.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q)) ||
        (s.phone && s.phone.includes(q))
      );
    }
    return filtered;
  }, [stations, filterStatus, searchQuery]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this pickup station? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await pickupStationsAPI.deleteStation(id);
      if (res.success) {
        setStations(stations.filter(s => s.stationId !== id));
        showToast('success', 'Pickup station deleted successfully');
      } else {
        showToast('error', 'Failed to delete pickup station');
      }
    } catch (error) {
      console.error('Error deleting pickup station:', error);
      showToast('error', 'An error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await pickupStationsAPI.toggleStationStatus(id);
      if (res.success) {
        setStations(stations.map(s => s.stationId === id ? { ...s, isActive: !s.isActive } : s));
        const newStatus = !stations.find(s => s.stationId === id)?.isActive;
        showToast('success', `Station ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        showToast('error', 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling station status:', error);
      showToast('error', 'An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="pickup-loading">
        <div className="pickup-loader"></div>
        <p>Loading pickup stations...</p>
      </div>
    );
  }

  return (
    <div className="pickup-page">
      {toast && (
        <div className={`pickup-toast ${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      <div className="pickup-header">
        <div>
          <h2>Pickup Stations</h2>
          <p className="pickup-subtitle">Manage pickup stations and locations across Kenya</p>
        </div>
        <Link to="/admin/pickup-stations/create" className="btn-primary">
          <Plus size={18} /> Add Station
        </Link>
      </div>

      <div className="pickup-filters">
        <div className="pickup-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, county, town, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="pickup-filter">
          <Filter size={16} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="pickup-table-container">
        <table className="pickup-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>County</th>
              <th>Town</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStations.length === 0 ? (
              <tr>
                <td colSpan={7} className="pickup-empty">
                  <span>📍</span>
                  <p>No pickup stations found</p>
                  <Link to="/admin/pickup-stations/create" className="btn-primary btn-sm">Add your first station</Link>
                </td>
              </tr>
            ) : (
              filteredStations.map((station) => (
                <tr key={station.stationId} className={station.isActive ? '' : 'inactive-row'}>
                  <td className="station-name">{station.name}</td>
                  <td>{station.county}</td>
                  <td>{station.town}</td>
                  <td className="station-address">{station.address}</td>
                  <td>
                    <div className="station-contact">
                      {station.phone && (
                        <span className="contact-item">
                          <Phone size={12} />
                          <a href={`tel:${station.phone}`}>{station.phone}</a>
                        </span>
                      )}
                      {station.email && (
                        <span className="contact-item">
                          <Mail size={12} />
                          <a href={`mailto:${station.email}`}>{station.email}</a>
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${station.isActive ? 'status-active' : 'status-inactive'}`}>
                      {station.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="pickup-actions">
                    <Link to={`/admin/pickup-stations/edit/${station.stationId}`} className="action-btn edit" title="Edit">
                      <Edit size={16} />
                    </Link>
                    <button
                      className="action-btn toggle"
                      onClick={() => handleToggleStatus(station.stationId)}
                      title={station.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(station.stationId)}
                      disabled={deletingId === station.stationId}
                      title="Delete"
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
    </div>
  );
}