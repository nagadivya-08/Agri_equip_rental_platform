import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.type || !formData.pricePerDay) {
      setError('Please fill in required fields (Name, Type, Price).');
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

      navigate('/my-listings');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to update equipment listing'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading equipment details...</p>
      </div>
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
                <option value="tractor">Tractor</option>
                <option value="harvester">Harvester</option>
                <option value="sprayer">Sprayer</option>
                <option value="tiller">Tiller</option>
                <option value="drone">Agricultural Drone</option>
                <option value="other">Other Equipment</option>
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

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={existingImages.length + newImages.length >= 5}
            />
            <small className="helper-text">
              Total images: {existingImages.length + newImages.length} of 5
            </small>

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
