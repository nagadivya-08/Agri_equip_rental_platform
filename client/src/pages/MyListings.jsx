import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import EquipmentCard from '../components/EquipmentCard';
import Spinner from '../components/Spinner';

const MyListings = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

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

    setDeletingId(id);
    setDeleteError('');
    try {
      await api.delete(`/equipment/${id}`);
      const successMsg = `"${name}" was successfully deleted.`;
      toast.success(successMsg);
      setDeleteMessage(successMsg);
      setDeleteError('');
      setEquipmentList((prev) => prev.filter((item) => item._id !== id));
      setTimeout(() => setDeleteMessage(''), 4000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to delete equipment listing';
      setDeleteError(errMsg);
      toast.error(errMsg, { duration: 6000 });
      setTimeout(() => setDeleteError(''), 8000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="my-listings-page">
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

        {deleteError && (
          <div className="notice-banner warning-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ {deleteError}</span>
            <button
              onClick={() => setDeleteError('')}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.5rem' }}
              title="Dismiss notice"
            >
              ✕
            </button>
          </div>
        )}

        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <Spinner message="Loading your equipment listings..." />
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
                isDeleting={deletingId === item._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
