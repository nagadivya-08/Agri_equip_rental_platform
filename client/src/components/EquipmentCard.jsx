import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../context/LanguageContext';

const EquipmentCard = ({ equipment, isOwnerView, showStatus, onDelete }) => {
  const { t } = useLanguage();

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
            {equipment.status === 'pending' && `⏳ ${t('common.pending') || 'Pending Review'}`}
            {equipment.status === 'approved' && `✅ ${t('common.approved') || 'Approved'}`}
            {equipment.status === 'rejected' && `❌ ${t('common.rejected') || 'Rejected'}`}
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

        <div className="card-rating-line">
          {equipment.reviewCount > 0 ? (
            <span className="card-rating-badge">
              ★ {equipment.averageRating}{' '}
              <span className="card-rating-count">({equipment.reviewCount})</span>
            </span>
          ) : (
            <span className="card-rating-new">★ New</span>
          )}
        </div>

        <p className="card-location">
          📍 {equipment.locationName || 'Location not specified'}
        </p>

        <div className="card-pricing">
          <span className="price-amount">₹{equipment.pricePerDay}</span>
          <span className="price-unit">{t('common.perDay') || '/ day'}</span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          {isOwnerView ? (
            <div className="owner-card-actions">
              <Link
                to={`/edit-equipment/${equipment._id}`}
                className="btn-card-edit"
              >
                ✏️ {t('common.edit') || 'Edit'}
              </Link>
              <button
                onClick={() => onDelete(equipment._id, equipment.name)}
                className="btn-card-delete"
              >
                🗑️ {t('common.delete') || 'Delete'}
              </button>
            </div>
          ) : (
            <Link
              to={`/equipment/${equipment._id}`}
              className="btn-card-details"
            >
              {t('common.viewDetails') || 'View Details'} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
