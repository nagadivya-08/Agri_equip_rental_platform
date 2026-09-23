import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { EQUIPMENT_TYPES } from '../constants/equipmentTypes';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Equipment name is required';
    if (!formData.type) newErrors.type = 'Equipment type is required';
    if (!formData.pricePerDay) newErrors.pricePerDay = 'Price per day is required';
    else if (Number(formData.pricePerDay) < 0) newErrors.pricePerDay = 'Price cannot be negative';

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
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
              <input
                id="pricePerDay"
                type="number"
                name="pricePerDay"
                placeholder="e.g. 2500"
                min="0"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />
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
            />
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
          <div className="form-group">
            <label htmlFor="images">
              Upload Images (Max 5, JPEG/PNG/WebP)
            </label>
            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={selectedImages.length >= 5}
            />
            <small className="helper-text">
              Selected {selectedImages.length} of 5 images
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Publishing Listing...' : 'Publish Equipment Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEquipment;
