import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Loader from '../components/Loader';
import { EQUIPMENT_TYPES, getEquipmentTypeLabel } from '../constants/equipmentTypes';
import CameraCaptureModal from '../components/CameraCaptureModal';

const EditEquipment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'tractor',
    description: '',
    pricePerDay: '',
    locationName: '',
    latitude: '',
    longitude: '',
    isAvailable: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch current equipment data
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/${id}`);
        const data = res.data.data;
        setFormData({
          name: data.name || '',
          type: data.type || 'tractor',
          description: data.description || '',
          pricePerDay: data.pricePerDay || '',
          locationName: data.locationName || '',
          latitude: data.location?.coordinates?.[1] || '',
          longitude: data.location?.coordinates?.[0] || '',
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        });
        setExistingImages(data.images || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load equipment details for editing'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + newImages.length + files.length;

    if (totalCount > 5) {
      setError('You can have a maximum of 5 images in total.');
      return;
    }

    const updatedNewFiles = [...newImages, ...files];
    setNewImages(updatedNewFiles);

    const previews = updatedNewFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews(previews);
    if (error) setError('');
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    const updated = newImages.filter((_, idx) => idx !== indexToRemove);
    setNewImages(updated);
    setNewPreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  const handlePhotoCaptured = (file) => {
    const totalCount = existingImages.length + newImages.length;
    if (totalCount >= 5) {
      setError('You can have a maximum of 5 images in total.');
      toast.error('Maximum 5 images allowed.');
      return;
    }

    const updatedNewFiles = [...newImages, file];
    setNewImages(updatedNewFiles);
    const previews = updatedNewFiles.map((f) => URL.createObjectURL(f));
    setNewPreviews(previews);
    if (error) setError('');
    toast.success('📸 Photo added from camera!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.type ||
      !formData.pricePerDay ||
      isNaN(Number(formData.pricePerDay)) ||
      Number(formData.pricePerDay) <= 0
    ) {
      const errTxt = 'Please fill in valid required fields (Name, Type, and Price > 0).';
      setError(errTxt);
      toast.error(errTxt);
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('pricePerDay', formData.pricePerDay);
      data.append('locationName', formData.locationName);
      data.append('isAvailable', formData.isAvailable);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);

      // Pass existing image URLs to keep
      existingImages.forEach((imgUrl) => {
        data.append('existingImages', imgUrl);
      });

      // Pass newly selected image files
      newImages.forEach((file) => {
        data.append('images', file);
      });

      await api.patch(`/equipment/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('🚜 Equipment listing updated successfully!');
      navigate('/my-listings');
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update equipment listing';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Loader
        fullPage
        message="Loading equipment details..."
        submessage="Fetching machinery specifications and media..."
      />
    );
  }

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="page-header-row">
          <div>
            <h2>Edit Equipment Listing</h2>
            <p className="page-subtitle">Update details for "{formData.name}"</p>
          </div>
          <Link to="/my-listings" className="btn-secondary">
            ← Cancel & Return
          </Link>
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-group">
            <label htmlFor="name">Equipment Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Equipment Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                {EQUIPMENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
                {!EQUIPMENT_TYPES.some((t) => t.value === formData.type) && formData.type && (
                  <option value={formData.type}>
                    {getEquipmentTypeLabel(formData.type)}
                  </option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
              <input
                id="pricePerDay"
                type="number"
                name="pricePerDay"
                min="0"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locationName">Location / Town / Village</label>
            <input
              id="locationName"
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />{' '}
              Equipment is Currently Available for Rent
            </label>
          </div>

          {/* Current & New Images */}
          <div className="form-group">
            <label>Images (Total Max 5)</label>

            {existingImages.length > 0 && (
              <div>
                <small className="helper-text">Current Images:</small>
                <div className="image-previews-grid">
                  {existingImages.map((imgUrl, idx) => (
                    <div key={idx} className="preview-item">
                      <img
                        src={
                          imgUrl.startsWith('http')
                            ? imgUrl
                            : `http://localhost:5000${imgUrl}`
                        }
                        alt={`current-${idx}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className="btn-remove-preview"
                        title="Remove existing image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="image-source-actions">
              <button
                type="button"
                className="btn-source-action btn-camera-action"
                onClick={() => setIsCameraOpen(true)}
                disabled={existingImages.length + newImages.length >= 5}
              >
                <span className="source-icon">📷</span>
                <span className="source-title">Take Photo with Camera</span>
                <span className="source-desc">Live camera access</span>
              </button>

              <button
                type="button"
                className="btn-source-action btn-browse-action"
                onClick={() => fileInputRef.current?.click()}
                disabled={existingImages.length + newImages.length >= 5}
              >
                <span className="source-icon">📁</span>
                <span className="source-title">Browse Files on Device</span>
                <span className="source-desc">Choose from gallery / storage</span>
              </button>

              {/* Hidden file input for device browse */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
                disabled={existingImages.length + newImages.length >= 5}
              />
            </div>

            <small className="helper-text">
              Total photos: {existingImages.length + newImages.length} of 5
            </small>

            <CameraCaptureModal
              isOpen={isCameraOpen}
              onClose={() => setIsCameraOpen(false)}
              onCapture={handlePhotoCaptured}
            />

            {newPreviews.length > 0 && (
              <div>
                <small className="helper-text">New Images to Upload:</small>
                <div className="image-previews-grid">
                  {newPreviews.map((preview, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={preview} alt={`new-${idx}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="btn-remove-preview"
                        title="Remove new image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Saving Changes...' : 'Save & Update Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditEquipment;
