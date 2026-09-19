import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const EquipmentDetail = () => {
  const { id } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/equipment/${id}`);
        setEquipment(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load equipment details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:5000${path}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <p>Loading equipment specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="page-container">
        <div className="empty-state-card">
          <span className="empty-icon">⚠️</span>
          <h3>Equipment Not Found</h3>
          <p>{error || 'The requested equipment listing could not be found.'}</p>
          <Link to="/equipment" className="btn-primary">
            ← Back to Browse Equipment
          </Link>
        </div>
      </div>
    );
  }

  const images = equipment.images && equipment.images.length > 0 ? equipment.images : [];
  const currentImage = images[activeImageIndex]
    ? getFullImageUrl(images[activeImageIndex])
    : null;

  return (
    <div className="page-container">
      <div className="breadcrumb-bar">
        <Link to="/equipment">← Back to All Equipment</Link>
      </div>

      <div className="equipment-detail-layout">
        {/* Left Column: Image Gallery */}
        <div className="detail-gallery-col">
          <div className="main-image-viewport">
            {currentImage ? (
              <img
                src={currentImage}
                alt={equipment.name}
                className="detail-main-image"
              />
            ) : (
              <div className="detail-no-image">
                <span>🚜</span>
                <p>No photos uploaded for this equipment</p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="detail-thumbnails-row">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`thumbnail-btn ${
                    activeImageIndex === idx ? 'thumbnail-active' : ''
                  }`}
                >
                  <img src={getFullImageUrl(img)} alt={`thumb-${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Owner Info */}
        <div className="detail-info-col">
          <div className="detail-header">
            <span className="detail-type-pill">
              {equipment.type ? equipment.type.toUpperCase() : 'EQUIPMENT'}
            </span>
            <h1 className="detail-title">{equipment.name}</h1>
            <p className="detail-location">
              📍 {equipment.locationName || 'Location not specified'}
            </p>
          </div>

          <div className="detail-price-box">
            <span className="price-big">₹{equipment.pricePerDay}</span>
            <span className="price-term">/ day</span>
            <span
              className={`availability-pill ${
                equipment.isAvailable ? 'avail-yes' : 'avail-no'
              }`}
            >
              {equipment.isAvailable ? 'Available for Rent' : 'Currently Unavailable'}
            </span>
          </div>

          <div className="detail-section">
            <h3>Equipment Description</h3>
            <p className="detail-description-text">
              {equipment.description || 'No description provided by owner.'}
            </p>
          </div>

          {/* Owner Details Card */}
          <div className="owner-card">
            <h3>Owner Contact Information</h3>
            <div className="owner-details">
              <p>
                <strong>Owner Name:</strong> {equipment.ownerId?.name || 'Verified Owner'}
              </p>
              <p>
                <strong>Contact Phone:</strong>{' '}
                {equipment.ownerId?.phone ? (
                  <a href={`tel:${equipment.ownerId.phone}`} className="phone-link">
                    📞 {equipment.ownerId.phone}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            </div>
          </div>

          {/* Booking Action */}
          <div className="booking-card">
            <button className="btn-book-now" disabled>
              Book Now (Coming in Phase 4)
            </button>
            <p className="booking-note">
              Direct online booking and payment integration will be enabled in Phase 4.
              In the meantime, feel free to contact the owner directly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
