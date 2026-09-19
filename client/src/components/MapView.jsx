import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getImageUrl } from '../utils/imageUrl';

// Fix Leaflet marker asset resolution in Vite/Webpack bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically fit map bounds to markers
const MapBoundsUpdater = ({ markers }) => {
  const map = useMap();

  useEffect(() => {
    if (!markers || markers.length === 0) return;

    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 12);
      return;
    }

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [markers, map]);

  return null;
};

const MapView = ({ equipmentList = [] }) => {
  // Extract valid [lat, lng] markers from equipment GeoJSON [lng, lat]
  const validMarkers = useMemo(() => {
    return equipmentList
      .filter((item) => {
        const coords = item.location?.coordinates;
        return (
          Array.isArray(coords) &&
          coords.length === 2 &&
          !isNaN(coords[0]) &&
          !isNaN(coords[1]) &&
          !(coords[0] === 0 && coords[1] === 0)
        );
      })
      .map((item) => ({
        id: item._id,
        equipment: item,
        // GeoJSON: [longitude, latitude] -> Leaflet: [latitude, longitude]
        lat: item.location.coordinates[1],
        lng: item.location.coordinates[0],
      }));
  }, [equipmentList]);

  // Default center if no valid markers
  const defaultCenter = [20.5937, 78.9629]; // Geographic center of India
  const center = validMarkers.length > 0 ? [validMarkers[0].lat, validMarkers[0].lng] : defaultCenter;
  const zoom = validMarkers.length > 0 ? 10 : 5;

  return (
    <div className="map-view-wrapper">
      <div className="map-view-header">
        <span className="map-stats-badge">
          📍 Showing {validMarkers.length} mapped {validMarkers.length === 1 ? 'location' : 'locations'}
        </span>
        {validMarkers.length < equipmentList.length && (
          <span className="map-info-note">
            ({equipmentList.length - validMarkers.length} listings have no GPS coordinates)
          </span>
        )}
      </div>

      <div className="leaflet-map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '550px', borderRadius: '12px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater markers={validMarkers} />

          {validMarkers.map(({ id, equipment, lat, lng }) => {
            const primaryImg =
              equipment.images && equipment.images.length > 0
                ? getImageUrl(equipment.images[0])
                : null;

            return (
              <Marker key={id} position={[lat, lng]}>
                <Popup className="equipment-map-popup">
                  <div className="popup-card">
                    {primaryImg && (
                      <div className="popup-image-wrap">
                        <img
                          src={primaryImg}
                          alt={equipment.name}
                          className="popup-thumb"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="popup-content">
                      <span className="popup-type-tag">{equipment.type}</span>
                      <h4 className="popup-title">{equipment.name}</h4>
                      <p className="popup-price">
                        <strong>₹{equipment.pricePerDay}</strong> / day
                      </p>
                      {equipment.locationName && (
                        <p className="popup-location">📍 {equipment.locationName}</p>
                      )}
                      <Link
                        to={`/equipment/${equipment._id}`}
                        className="popup-view-btn"
                      >
                        View Details & Book →
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
