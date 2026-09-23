import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import EquipmentCard from '../components/EquipmentCard';
import MapView from '../components/MapView';
import Spinner from '../components/Spinner';
import AudioToggle from '../components/AudioToggle';
import {
  EQUIPMENT_TYPES,
  getEquipmentTypeDetails,
  getRelatedEquipmentTypes,
} from '../constants/equipmentTypes';

const BrowseEquipment = () => {
  const { t } = useLanguage();
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Filters state (prefill from query string if available)
  const [search, setSearch] = useState(searchParams.get('search') || '');
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
      if (search && search.trim() !== '') {
        params.append('search', search.trim());
      }
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
  }, [search, type, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
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
          <h2>🚜 {t('browse.title') || 'Find Agricultural Equipment for Rent'}</h2>
          <p className="page-subtitle">
            {t('browse.subtitle') || 'Affordable, verified machinery from local owners to power your farming operations'}
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-card">
          <div className="filter-row">
            {/* Keyword Search Filter */}
            <div className="filter-group search-filter-group">
              <label htmlFor="search-input">Search Equipment</label>
              <div className="type-search-input-wrapper">
                <span className="type-search-icon" aria-hidden="true">🔍</span>
                <input
                  id="search-input"
                  type="text"
                  className="type-search-input"
                  placeholder="Search by name, model, village..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
                {search && (
                  <button
                    type="button"
                    className="type-search-clear-btn"
                    onClick={() => setSearch('')}
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Type Filter Dropdown - Connected to EQUIPMENT_TYPES */}
            <div className="filter-group type-dropdown-group">
              <label htmlFor="equipment-type-select">{t('browse.equipmentType') || 'Equipment Type'}</label>
              <div className="type-select-wrapper">
                <select
                  id="equipment-type-select"
                  className="type-select-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All Equipment Types ({EQUIPMENT_TYPES.length})</option>
                  {EQUIPMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group price-filter">
              <label>{t('browse.priceRange') || 'Price Range (₹/day)'}</label>
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
                title={t('browse.clearFilters') || 'Clear Filters'}
              >
                {t('browse.clearFilters') || 'Clear Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Selected Equipment Type Details & Related Categories Banner */}
        {type && type.toLowerCase() !== 'all' && (
          (() => {
            const details = getEquipmentTypeDetails(type);
            const related = getRelatedEquipmentTypes(type);
            if (!details) return null;

            return (
              <div className="active-type-details-banner">
                <div className="active-type-header">
                  <div className="active-type-badge-cluster">
                    <span className="active-type-icon">{details.icon}</span>
                    <div>
                      <div className="active-type-tags">
                        <span className="active-type-cat">{details.category}</span>
                        <span className="active-type-title">{details.label} Category Guide</span>
                      </div>
                      <p className="active-type-desc">{details.description}</p>
                    </div>
                  </div>
                </div>

                <div className="active-type-specs-row">
                  <span className="active-spec-pill">
                    ⚡ <strong>Power/Specs:</strong> {details.typicalPower}
                  </span>
                  <span className="active-spec-pill">
                    🌾 <strong>Best Suited:</strong> {details.bestSuitedFor}
                  </span>
                </div>

                {related && related.length > 0 && (
                  <div className="active-type-related-container">
                    <span className="related-types-caption">
                      🔗 Related Equipment Types (click to view):
                    </span>
                    <div className="related-types-chips">
                      {related.map((rel) => (
                        <button
                          key={rel.value}
                          type="button"
                          className="related-type-chip-btn"
                          onClick={() => setType(rel.value)}
                          title={`Switch filter to ${rel.label} (${rel.category})`}
                        >
                          <span className="chip-icon">{rel.icon}</span>
                          <span className="chip-name">{rel.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {error && <p className="error-text">{error}</p>}

        {/* Results Section */}
        {loading ? (
          <Spinner message={t('common.loading') || 'Searching verified agricultural equipment...'} />
        ) : equipmentList.length === 0 ? (
          <div className="empty-state-card">
            <span className="empty-icon">🔍</span>
            <h3>{t('browse.noResultsTitle') || 'No Equipment Found'}</h3>
            <p>
              {t('browse.noResultsDesc') ||
                'No approved equipment matches your current search filters. Try adjusting or clearing the filters above.'}
            </p>
            <button onClick={handleResetFilters} className="btn-primary">
              {t('browse.resetBtn') || 'Reset Filters'}
            </button>
          </div>
        ) : (
          <>
            <div className="results-count-bar">
              <span>{t('browse.showingCount', { count: equipmentList.length }) || `Showing ${equipmentList.length} available equipment`}</span>

              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`btn-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="View equipment cards"
                >
                  {t('browse.listView') || '📋 List View'}
                </button>
                <button
                  type="button"
                  className={`btn-view-toggle ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  title="View equipment on map"
                >
                  {t('browse.mapView') || '🗺️ Map View'}
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
