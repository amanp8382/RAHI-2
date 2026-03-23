import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import './OSMMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom POI Icons
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    html: `<div class="custom-marker" style="background-color: ${color};">
             <span class="marker-symbol">${symbol}</span>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const POI_ICONS = {
  hotel: createCustomIcon('#4F46E5', '🏨'),
  restaurant: createCustomIcon('#DC2626', '🍽️'),
  tourist: createCustomIcon('#059669', '🏛️'),
  shopping: createCustomIcon('#D97706', '🛍️'),
  transport: createCustomIcon('#7C3AED', '🚌'),
  hospital: createCustomIcon('#DC2626', '🏥'),
  user: createCustomIcon('#2563EB', '📍')
};

// Sample POI data for Delhi
const SAMPLE_POIS = [
  // Tourist Attractions
  { id: 1, name: 'Red Fort', type: 'tourist', lat: 28.6562, lng: 77.2410, 
    description: 'Historic Mughal fortress and UNESCO World Heritage Site', 
    rating: 4.5, openHours: '9:30 AM - 4:30 PM' },
  { id: 2, name: 'India Gate', type: 'tourist', lat: 28.6129, lng: 77.2295,
    description: 'War memorial and iconic landmark of Delhi',
    rating: 4.3, openHours: 'Open 24 hours' },
  { id: 3, name: 'Lotus Temple', type: 'tourist', lat: 28.5535, lng: 77.2588,
    description: 'Bahá\'í House of Worship known for its lotus-shaped architecture',
    rating: 4.6, openHours: '9:00 AM - 5:30 PM' },
  { id: 4, name: 'Qutub Minar', type: 'tourist', lat: 28.5245, lng: 77.1855,
    description: 'Medieval Islamic monument and UNESCO World Heritage Site',
    rating: 4.4, openHours: '7:00 AM - 5:00 PM' },
  
  // Hotels
  { id: 5, name: 'The Imperial Hotel', type: 'hotel', lat: 28.6289, lng: 77.2196,
    description: 'Luxury heritage hotel in Connaught Place',
    rating: 4.8, price: '₹15,000/night' },
  { id: 6, name: 'The Oberoi New Delhi', type: 'hotel', lat: 28.5975, lng: 77.2001,
    description: 'Premium luxury hotel with excellent service',
    rating: 4.7, price: '₹20,000/night' },
  
  // Restaurants
  { id: 7, name: 'Karim\'s', type: 'restaurant', lat: 28.6507, lng: 77.2334,
    description: 'Famous for traditional Mughlai cuisine since 1913',
    rating: 4.2, cuisine: 'Mughlai', priceRange: '₹₹' },
  { id: 8, name: 'Indian Accent', type: 'restaurant', lat: 28.5975, lng: 77.2001,
    description: 'Award-winning contemporary Indian restaurant',
    rating: 4.6, cuisine: 'Contemporary Indian', priceRange: '₹₹₹₹' },
  { id: 9, name: 'Paranthe Wali Gali', type: 'restaurant', lat: 28.6585, lng: 77.2345,
    description: 'Famous street food lane known for paranthas',
    rating: 4.0, cuisine: 'Street Food', priceRange: '₹' },
  
  // Shopping
  { id: 10, name: 'Connaught Place', type: 'shopping', lat: 28.6315, lng: 77.2167,
    description: 'Major commercial and business center with shops and restaurants',
    rating: 4.1, category: 'Shopping & Dining' },
  { id: 11, name: 'Khan Market', type: 'shopping', lat: 28.5975, lng: 77.2298,
    description: 'Upmarket shopping area with boutiques and cafes',
    rating: 4.3, category: 'Premium Shopping' },
  
  // Transport
  { id: 12, name: 'New Delhi Railway Station', type: 'transport', lat: 28.6431, lng: 77.2197,
    description: 'Major railway station serving New Delhi',
    rating: 3.8, category: 'Railway Station' },
  { id: 13, name: 'Indira Gandhi International Airport', type: 'transport', lat: 28.5562, lng: 77.1000,
    description: 'Main international airport serving Delhi NCR',
    rating: 4.0, category: 'Airport' }
];

// Location tracker component
const LocationMarker = ({ position, setPosition, onLocationUpdate }) => {
  const map = useMapEvents({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationUpdate) {
        onLocationUpdate({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          address: `Location: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
        });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={POI_ICONS.user}>
      <Popup>
        <div className="user-location-popup">
          <h3>📍 Your Location</h3>
          <p>Lat: {position.lat.toFixed(4)}</p>
          <p>Lng: {position.lng.toFixed(4)}</p>
          <button onClick={() => map.locate()}>Update Location</button>
        </div>
      </Popup>
    </Marker>
  );
};

// Routing component
const RoutingMachine = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      routeWhileDragging: true,
      geocoder: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: '#2563EB', weight: 4, opacity: 0.7 }]
      },
      createMarker: () => null // Hide default markers
    }).addTo(map);

    // Handle route found
    routingControlRef.current.on('routesfound', (e) => {
      const routes = e.routes;
      const summary = routes[0].summary;
      if (onRouteFound) {
        onRouteFound({
          distance: (summary.totalDistance / 1000).toFixed(2) + ' km',
          time: Math.round(summary.totalTime / 60) + ' mins'
        });
      }
    });

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [start, end, map, onRouteFound]);

  return null;
};

// POI Filter Component
const POIFilter = ({ pois, onFilterChange, activeFilters }) => {
  const poiTypes = [...new Set(pois.map(poi => poi.type))];
  
  const toggleFilter = (type) => {
    const newFilters = activeFilters.includes(type) 
      ? activeFilters.filter(f => f !== type)
      : [...activeFilters, type];
    onFilterChange(newFilters);
  };

  return (
    <div className="poi-filter">
      <h4>Filter POIs:</h4>
      <div className="filter-buttons">
        {poiTypes.map(type => (
          <button
            key={type}
            className={`filter-btn ${activeFilters.includes(type) ? 'active' : ''}`}
            onClick={() => toggleFilter(type)}
          >
            {type === 'tourist' && '🏛️'} 
            {type === 'hotel' && '🏨'} 
            {type === 'restaurant' && '🍽️'} 
            {type === 'shopping' && '🛍️'} 
            {type === 'transport' && '🚌'}
            <span className="filter-text">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main OSM Map Component
const OSMMap = ({ onLocationUpdate }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [pois] = useState(SAMPLE_POIS);
  const [activeFilters, setActiveFilters] = useState(['tourist', 'hotel', 'restaurant']);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [showRouting, setShowRouting] = useState(false);

  // Default center (Delhi)
  const defaultCenter = [28.6139, 77.2090];

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPosition(pos);
          if (onLocationUpdate) {
            onLocationUpdate({
              lat: pos.lat,
              lng: pos.lng,
              address: `Current Location: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`
            });
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Use default Delhi location
          const defaultPos = { lat: defaultCenter[0], lng: defaultCenter[1] };
          setUserPosition(defaultPos);
          if (onLocationUpdate) {
            onLocationUpdate({
              lat: defaultPos.lat,
              lng: defaultPos.lng,
              address: 'Delhi, India (Default)'
            });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, [onLocationUpdate]);

  // Filter POIs based on active filters
  const filteredPois = pois.filter(poi => activeFilters.includes(poi.type));

  const handlePOIClick = (poi) => {
    if (showRouting && userPosition) {
      setRouteStart(userPosition);
      setRouteEnd({ lat: poi.lat, lng: poi.lng });
    }
  };

  const clearRoute = () => {
    setRouteStart(null);
    setRouteEnd(null);
    setRouteInfo(null);
  };

  return (
    <div className="osm-map-container">
      {/* Map Controls */}
      <div className="map-controls">
        <POIFilter 
          pois={pois} 
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
        
        <div className="routing-controls">
          <button 
            className={`routing-btn ${showRouting ? 'active' : ''}`}
            onClick={() => {
              setShowRouting(!showRouting);
              if (!showRouting) clearRoute();
            }}
          >
            🗺️ {showRouting ? 'Disable' : 'Enable'} Routing
          </button>
          
          {showRouting && (
            <div className="routing-info">
              <p>Click on any POI to get directions</p>
              {routeInfo && (
                <div className="route-summary">
                  <p>📍 Distance: {routeInfo.distance}</p>
                  <p>⏱️ Time: {routeInfo.time}</p>
                  <button onClick={clearRoute} className="clear-route-btn">Clear Route</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={userPosition ? [userPosition.lat, userPosition.lng] : defaultCenter}
        zoom={12}
        className="leaflet-map"
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        <LocationMarker 
          position={userPosition} 
          setPosition={setUserPosition}
          onLocationUpdate={onLocationUpdate}
        />

        {/* POI Markers */}
        {filteredPois.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.lat, poi.lng]}
            icon={POI_ICONS[poi.type]}
            eventHandlers={{
              click: () => handlePOIClick(poi)
            }}
          >
            <Popup>
              <div className="poi-popup">
                <h3>{poi.name}</h3>
                <p className="poi-description">{poi.description}</p>
                
                {poi.rating && (
                  <div className="poi-rating">
                    ⭐ {poi.rating}/5
                  </div>
                )}
                
                {poi.openHours && (
                  <div className="poi-hours">
                    🕒 {poi.openHours}
                  </div>
                )}
                
                {poi.price && (
                  <div className="poi-price">
                    💰 {poi.price}
                  </div>
                )}
                
                {poi.cuisine && (
                  <div className="poi-cuisine">
                    🍽️ {poi.cuisine} • {poi.priceRange}
                  </div>
                )}
                
                <div className="poi-coordinates">
                  📍 {poi.lat.toFixed(4)}, {poi.lng.toFixed(4)}
                </div>
                
                {showRouting && userPosition && (
                  <button 
                    className="get-directions-btn"
                    onClick={() => handlePOIClick(poi)}
                  >
                    🗺️ Get Directions
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routing */}
        {routeStart && routeEnd && (
          <RoutingMachine 
            start={routeStart}
            end={routeEnd}
            onRouteFound={setRouteInfo}
          />
        )}
      </MapContainer>

      {/* POI Statistics */}
      <div className="poi-stats">
        <div className="stat-item">
          <span className="stat-number">{filteredPois.filter(poi => poi.type === 'tourist').length}</span>
          <span className="stat-label">Tourist Spots</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredPois.filter(poi => poi.type === 'restaurant').length}</span>
          <span className="stat-label">Restaurants</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredPois.filter(poi => poi.type === 'hotel').length}</span>
          <span className="stat-label">Hotels</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredPois.length}</span>
          <span className="stat-label">Total POIs</span>
        </div>
      </div>
    </div>
  );
};

export default OSMMap;