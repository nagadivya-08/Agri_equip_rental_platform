import { Link } from 'react-router-dom';

const EquipmentCard = ({ equipment, isOwnerView, showStatus, onDelete }) => {
  // Build image URL: if relative /uploads/..., prefix with backend server host
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath}`;
  };

  const primaryImage =
    equipment.images && equipment.images.length > 0
      ? getImageUrl(equipment.images[0])
      : null;

  return (
    <div className="equipment-card">
      <div className="card-image-wrapper">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={equipment.name}
            className="card-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="card-image-placeholder"
          style={{ display: primaryImage ? 'none' : 'flex' }}
        >
          <span className="placeholder-icon">🚜</span>
          <span className="placeholder-text">No Image</span>
        </div>

        {/* Status Badge for Owner View */}
        {showStatus && (
          <span className={`status-badge status-${equipment.status}`}>
            {equipment.status === 'pending' && '⏳ Pending Review'}
            {equipment.status === 'approved' && '✅ Approved'}
            {equipment.status === 'rejected' && '❌ Rejected'}
          </span>
        )}

        {!equipment.isAvailable && (
          <span className="unavailable-badge">Not Available</span>
        )}
      </div>

      <div className="card-content">
        <div className="card-type-tag">
          {equipment.type ? equipment.type.toUpperCase() : 'EQUIPMENT'}
        </div>

        <h3 className="card-title" title={equipment.name}>
          {equipment.name}
        </h3>

        <p className="card-location">
          📍 {equipment.locationName || 'Location not specified'}
        </p>

        <div className="card-pricing">
          <span className="price-amount">₹{equipment.pricePerDay}</span>
          <span className="price-unit">/ day</span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          {isOwnerView ? (
            <div className="owner-card-actions">
              <Link
                to={`/edit-equipment/${equipment._id}`}
                className="btn-card-edit"
              >
                ✏️ Edit
              </Link>
              <button
                onClick={() => onDelete(equipment._id, equipment.name)}
                className="btn-card-delete"
              >
                🗑️ Delete
              </button>
            </div>
          ) : (
            <Link
              to={`/equipment/${equipment._id}`}
              className="btn-card-details"
            >
              View Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
