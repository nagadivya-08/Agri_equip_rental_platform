import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EquipmentCard from '../components/EquipmentCard';
import MapView from '../components/MapView';
import Spinner from '../components/Spinner';

const BrowseEquipment = () => {
  const [searchParams] = useSearchParams();
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Filters state (prefill from query string if available)
  const [search, setSearch] = useState('');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (type && type !== 'all') params.append('type', type);
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

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, type, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="page-container">
      <div className="browse-hero">
        <h2>🚜 Find Agricultural Equipment for Rent</h2>
        <p className="page-subtitle">
          Affordable, verified machinery from local owners to power your farming operations
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-card">
        <div className="filter-row">
          <div className="filter-group search-filter">
            <label htmlFor="search">Search Equipment</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, model, town..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type">Equipment Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="tractor">Tractor</option>
              <option value="harvester">Harvester</option>
              <option value="sprayer">Sprayer</option>
              <option value="tiller">Tiller</option>
              <option value="drone">Agricultural Drone</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group price-filter">
            <label>Price Range (₹/day)</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="price-dash">-</span>
              <input
                type="number"
                placeholder="Max"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
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
  );
};

export default BrowseEquipment;
