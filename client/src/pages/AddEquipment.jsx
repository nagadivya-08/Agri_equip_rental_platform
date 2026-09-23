import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { EQUIPMENT_TYPES } from '../constants/equipmentTypes';
import CameraCaptureModal from '../components/CameraCaptureModal';

const AddEquipment = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'tractor',
    description: '',
    pricePerDay: '',
    locationName: '',
    latitude: '',
    longitude: '',
  });

  const [selectedImages, setSelectedImages] = useState([]); // File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Object URLs for previews
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (selectedImages.length + files.length > 5) {
      setError('You can upload a maximum of 5 images in total.');
      return;
    }

    const newFiles = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newFiles);

    // Generate previews
    const previews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    if (error) setError('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedFiles = selectedImages.filter((_, idx) => idx !== indexToRemove);
    setSelectedImages(updatedFiles);

    const updatedPreviews = updatedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(updatedPreviews);
  };

  const handlePhotoCaptured = (file) => {
    if (selectedImages.length >= 5) {
      setError('You can upload a maximum of 5 images in total.');
      toast.error('Maximum 5 images allowed.');
      return;
    }

    const updated = [...selectedImages, file];
    setSelectedImages(updated);
    const previews = updated.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);
    if (error) setError('');
    toast.success('📸 Photo added from camera!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Equipment name is required';
    if (!formData.type) newErrors.type = 'Equipment type is required';
    if (
      !formData.pricePerDay ||
      isNaN(Number(formData.pricePerDay)) ||
      Number(formData.pricePerDay) <= 0
    ) {
      newErrors.pricePerDay = 'Price per day must be a positive number greater than zero';
    }
    if (!formData.locationName.trim()) {
      newErrors.locationName = 'Location / town / village is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error('Please fix the required fields before submitting.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('pricePerDay', formData.pricePerDay);
      data.append('locationName', formData.locationName);
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);

      // Append image files
      selectedImages.forEach((file) => {
        data.append('images', file);
      });

      await api.post('/equipment', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('🚜 Equipment listing submitted! Awaiting administrator review.');
      navigate('/my-listings');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to create equipment listing';
      setError(msg);
      toast.error(msg);

      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const backendMap = {};
        err.response.data.errors.forEach((e) => {
          backendMap[e.field] = e.message;
        });
        setFieldErrors(backendMap);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <div className="page-header-row">
          <div>
            <h2>Add New Equipment</h2>
            <p className="page-subtitle">
              List your agricultural equipment for farmers and renters
            </p>
          </div>
          <Link to="/my-listings" className="btn-secondary">
            ← Back to My Listings
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
              placeholder="e.g. Mahindra 575 DI Tractor"
              value={formData.name}
              onChange={handleChange}
              className={fieldErrors.name ? 'input-error' : ''}
              required
            />
            {fieldErrors.name && (
              <span className="field-error-text">⚠️ {fieldErrors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Equipment Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={fieldErrors.type ? 'input-error' : ''}
                required
              >
                {EQUIPMENT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {fieldErrors.type && (
                <span className="field-error-text">⚠️ {fieldErrors.type}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
              <input
                id="pricePerDay"
                type="number"
                name="pricePerDay"
                placeholder="e.g. 2500"
                min="1"
                value={formData.pricePerDay}
                onChange={handleChange}
                className={fieldErrors.pricePerDay ? 'input-error' : ''}
                required
              />
              {fieldErrors.pricePerDay && (
                <span className="field-error-text">⚠️ {fieldErrors.pricePerDay}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="locationName">Location / Town / Village *</label>
            <input
              id="locationName"
              type="text"
              name="locationName"
              placeholder="e.g. Guntur, Andhra Pradesh"
              value={formData.locationName}
              onChange={handleChange}
              className={fieldErrors.locationName ? 'input-error' : ''}
              required
            />
            {fieldErrors.locationName && (
              <span className="field-error-text">⚠️ {fieldErrors.locationName}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude (Optional)</label>
              <input
                id="latitude"
                type="number"
                step="any"
                name="latitude"
                placeholder="e.g. 16.3067"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude (Optional)</label>
              <input
                id="longitude"
                type="number"
                step="any"
                name="longitude"
                placeholder="e.g. 80.4365"
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
              placeholder="Describe condition, specifications, attachments included, rules, etc."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Image Upload & Previews */}
          <div className="form-group image-upload-section">
            <label htmlFor="images">
              Equipment Photos (Max 5, JPEG/PNG/WebP)
            </label>
            <p className="field-hint-text">
              Add photos using your device camera or browse existing image files on your device.
            </p>

            <div className="image-source-actions">
              <button
                type="button"
                className="btn-source-action btn-camera-action"
                onClick={() => setIsCameraOpen(true)}
                disabled={selectedImages.length >= 5}
              >
                <span className="source-icon">📷</span>
                <span className="source-title">Take Photo with Camera</span>
                <span className="source-desc">Live camera access</span>
              </button>

              <button
                type="button"
                className="btn-source-action btn-browse-action"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedImages.length >= 5}
              >
                <span className="source-icon">📁</span>
                <span className="source-title">Browse Files on Device</span>
                <span className="source-desc">Choose from gallery / storage</span>
              </button>

              {/* Hidden file input for device browse */}
              <input
                ref={fileInputRef}
                id="images"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageChange}
                disabled={selectedImages.length >= 5}
              />
            </div>

            <small className="helper-text">
              Selected {selectedImages.length} of 5 photos
            </small>

            {imagePreviews.length > 0 && (
              <div className="image-previews-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt={`preview-${index}`} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="btn-remove-preview"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CameraCaptureModal
            isOpen={isCameraOpen}
            onClose={() => setIsCameraOpen(false)}
            onCapture={handlePhotoCaptured}
          />

          {/* Admin Approval Notice Banner */}
          <div className="approval-notice-banner">
            <span className="approval-notice-icon">ℹ️</span>
            <div>
              <strong>Admin Approval Notice:</strong>
              <p>
                Your equipment listing will be reviewed by platform administrators before becoming visible to renters in the public catalog.
              </p>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Submitting for Approval...' : '🚀 Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment;
