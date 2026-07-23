import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pickupStationsAPI, type PickupStation } from '../../../../Features/pickupStations/pickupStationsAPI';
import './PickupStations.css';

export default function PickupStations() {
  const [stations, setStations] = useState<PickupStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await pickupStationsAPI.getAllStations();
        if (res.success) setStations(res.data);
      } catch (error) {
        console.error('Error fetching pickup stations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this pickup station?')) return;
    try {
      const res = await pickupStationsAPI.deleteStation(id);
      if (res.success) {
        setStations(stations.filter(s => s.stationId !== id));
      }
    } catch (error) {
      console.error('Error deleting pickup station:', error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await pickupStationsAPI.toggleStationStatus(id);
      if (res.success) {
        setStations(stations.map(s => s.stationId === id ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (error) {
      console.error('Error toggling station status:', error);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading pickup stations...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Pickup Stations</h2>
        <Link to="/admin/pickup-stations/create" className="btn-primary">Add Station</Link>
      </div>
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>County</th>
              <th>Town</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.length === 0 ? (
              <tr><td colSpan={7} className="empty-state">No pickup stations found</td></tr>
            ) : (
              stations.map((station) => (
                <tr key={station.stationId}>
                  <td className="station-name">{station.name}</td>
                  <td>{station.county}</td>
                  <td>{station.town}</td>
                  <td>{station.address}</td>
                  <td>{station.phone || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${station.isActive ? 'status-active' : 'status-inactive'}`}>
                      {station.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/admin/pickup-stations/edit/${station.stationId}`} className="action-btn edit">✏️</Link>
                    <button className="action-btn toggle" onClick={() => handleToggleStatus(station.stationId)}>
                      {station.isActive ? '🔴' : '🟢'}
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(station.stationId)}>🗑️</button>
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