import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EquipmentCard from '../components/EquipmentCard';

const MyListings = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const fetchMyEquipment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/equipment/my');
      setEquipmentList(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load your equipment listings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEquipment();
  }, []);

  const handleDelete = async (id, name) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      await api.delete(`/equipment/${id}`);
      setDeleteMessage(`"${name}" was successfully deleted.`);
      setEquipmentList((prev) => prev.filter((item) => item._id !== id));
      setTimeout(() => setDeleteMessage(''), 4000);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete equipment listing'
      );
    }
  };

  return (
    <div className="page-container">
      <div className="my-listings-header">
        <div>
          <h2>My Equipment Listings</h2>
          <p className="page-subtitle">
            Manage your registered agricultural machinery and view review statuses
          </p>
        </div>
        <Link to="/add-equipment" className="btn-primary">
          + Add New Equipment
        </Link>
      </div>

      {deleteMessage && (
        <div className="notice-banner success-banner">
          ✅ {deleteMessage}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <div className="loading-container">
          <p>Loading your equipment listings...</p>
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">🚜</span>
          <h3>No Equipment Listed Yet</h3>
          <p>
            You haven't added any equipment to the platform yet. Start earning by
            renting out your idle farm machinery!
          </p>
          <Link to="/add-equipment" className="btn-primary">
            List Your First Equipment
          </Link>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipmentList.map((item) => (
            <EquipmentCard
              key={item._id}
              equipment={item}
              isOwnerView={true}
              showStatus={true}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
