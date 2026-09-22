import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EquipmentCard from '../components/EquipmentCard';
import MapView from '../components/MapView';
import Spinner from '../components/Spinner';
import AudioToggle from '../components/AudioToggle';

const BrowseEquipment = () => {
  const [searchParams] = useSearchParams();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        videoRef.current.play().catch(() => { });
      }
    }
  };

  // Filters state (prefill from query string if available)
  const [type, setType] = useState(searchParams.get('type') || '');
  const [minPrice, setMinPrice] = useState('500');
  const [maxPrice, setMaxPrice] = useState('');

  // Stepper handlers for price filters (starts from ₹500, step 100)
  const handleMinPriceIncrement = () => {
    setMinPrice((prev) => {
      const num = Number(prev);
      if (!prev || isNaN(num) || num < 500) {
        return '500';
      }
      return String(num + 100);
    });
  };

  const handleMinPriceDecrement = () => {
    setMinPrice((prev) => {
      const num = Number(prev);
      if (!prev || isNaN(num) || num <= 500) {
        return '500';
      }
      return String(Math.max(500, num - 100));
    });
  };

  const handleMinPriceBlur = () => {
    if (minPrice !== '' && !isNaN(Number(minPrice)) && Number(minPrice) < 500) {
      setMinPrice('500');
    }
  };

  const handleMaxPriceIncrement = () => {
    setMaxPrice((prev) => {
      const num = Number(prev);
      if (!prev || isNaN(num)) {
        const minVal = Number(minPrice);
        return String(!isNaN(minVal) && minVal >= 500 ? minVal + 500 : '1000');
      }
      return String(num + 100);
    });
  };

  const handleMaxPriceDecrement = () => {
    setMaxPrice((prev) => {
      const num = Number(prev);
      if (!prev || isNaN(num) || num <= 500) {
        return '500';
      }
      return String(Math.max(500, num - 100));
    });
  };

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (type && type.toLowerCase() !== 'all' && type.trim() !== '') {
        params.append('type', type.trim());
      }
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await api.get(`/equipment?${params.toString()}`);
      setEquipmentList(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load available equipment'
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 300);

    return () => clearTimeout(timer);
  }, [type, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setType('');
    setMinPrice('500');
    setMaxPrice('');
  };

  return (
    <div className="browse-page">
      {/* Fixed Background Video */}
      <div className="browse-video-bg-container" aria-hidden="true">
        <video
          ref={videoRef}
          className="browse-video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/equip_browsing.mp4" type="video/mp4" />
        </video>
        <div className="browse-video-overlay" />
      </div>

      {/* Floating Audio On / Off Toggle Switch */}
      <AudioToggle isMuted={isMuted} onToggle={toggleAudio} id="browseAudioToggle" />

      <div className="page-container browse-content">
        <div className="browse-hero">
          <h2>🚜 Find Agricultural Equipment for Rent</h2>
          <p className="page-subtitle">
            Affordable, verified machinery from local owners to power your farming operations
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-card">
          <div className="filter-row">
            <div className="filter-group type-search-filter">
              <label htmlFor="type">Equipment Type</label>
              <div className="type-search-input-wrapper">
                <span className="type-search-icon" aria-hidden="true">🚜</span>
                <input
                  id="type"
                  list="equipment-types-list"
                  type="text"
                  className="type-search-input"
                  placeholder="Type or select equipment type (e.g. Tractor, Tiller, Sprayer...)"
                  value={type.toLowerCase() === 'all' ? '' : type}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.toLowerCase() === 'all types' || val.toLowerCase() === 'all') {
                      setType('');
                    } else {
                      setType(val);
                    }
                  }}
                  autoComplete="off"
                />
                {type && type.toLowerCase() !== 'all' && (
                  <button
                    type="button"
                    className="type-search-clear-btn"
                    onClick={() => setType('')}
                    title="Clear filter / Show all equipment"
                    aria-label="Clear equipment type filter"
                  >
                    ✕
                  </button>
                )}
              </div>
              <datalist id="equipment-types-list">
                <option value="Tractor" />
                <option value="Harvester" />
                <option value="Sprayer" />
                <option value="Tiller" />
                <option value="Agricultural Drone" />
                <option value="Other" />
              </datalist>
            </div>

            <div className="filter-group price-filter">
              <label>Price Range (₹/day)</label>
              <div className="price-inputs">
                <div className="price-stepper-box">
                  <button
                    type="button"
                    className="stepper-btn dec-btn"
                    onClick={handleMinPriceDecrement}
                    disabled={!minPrice || isNaN(Number(minPrice)) || Number(minPrice) <= 500}
                    title={!minPrice || Number(minPrice) <= 500 ? 'Minimum price cannot be less than ₹500' : 'Decrease min price by ₹100'}
                    aria-label="Decrease min price by 100"
                  >
                    −
                  </button>
                  <span className="stepper-currency">₹</span>
                  <input
                    id="minPrice"
                    type="number"
                    className="stepper-price-input"
                    placeholder="500"
                    min="500"
                    step="100"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={handleMinPriceBlur}
                  />
                  <button
                    type="button"
                    className="stepper-btn inc-btn"
                    onClick={handleMinPriceIncrement}
                    title="Increase min price by ₹100"
                    aria-label="Increase min price by 100"
                  >
                    +
                  </button>
                </div>

                <span className="price-dash">-</span>

                <div className="price-stepper-box">
                  <button
                    type="button"
                    className="stepper-btn dec-btn"
                    onClick={handleMaxPriceDecrement}
                    disabled={!maxPrice || isNaN(Number(maxPrice)) || Number(maxPrice) <= 500}
                    title={!maxPrice || Number(maxPrice) <= 500 ? 'Price cannot be less than ₹500' : 'Decrease max price by ₹100'}
                    aria-label="Decrease max price by 100"
                  >
                    −
                  </button>
                  <span className="stepper-currency">₹</span>
                  <input
                    id="maxPrice"
                    type="number"
                    className="stepper-price-input"
                    placeholder="Max"
                    min="500"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                  <button
                    type="button"
                    className="stepper-btn inc-btn"
                    onClick={handleMaxPriceIncrement}
                    title="Increase max price by ₹100"
                    aria-label="Increase max price by 100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="filter-action">
              <button
                onClick={handleResetFilters}
                className="btn-reset-filters"
                title="Reset all filters"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {/* Results Section */}
        {loading ? (
          <Spinner message="Searching verified agricultural equipment..." />
        ) : equipmentList.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">🔍</span>
            <h3>No Equipment Found</h3>
            <p>
              No approved equipment matches your current search filters. Try adjusting
              or clearing the filters above.
            </p>
            <button onClick={handleResetFilters} className="btn-primary">
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="results-count-bar">
              <span>Showing {equipmentList.length} available equipment</span>

              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="View equipment cards"
                >
                  📋 List View
                </button>
                <button
                  type="button"
                  className={`btn-view-toggle ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  title="View equipment on map"
                >
                  🗺️ Map View
                </button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <MapView equipmentList={equipmentList} />
            ) : (
              <div className="equipment-grid">
                {equipmentList.map((item) => (
                  <EquipmentCard
                    key={item._id}
                    equipment={item}
                    isOwnerView={false}
                    showStatus={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrowseEquipment;
