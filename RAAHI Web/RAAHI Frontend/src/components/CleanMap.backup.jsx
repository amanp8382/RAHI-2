import React, { useMemo, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { GEOFENCES } from '../config/geofences';

// BACKUP: This is a backup of the complex map implementation

// Fallback component when Google Maps fails to load
const FallbackMap = ({ userLocation, touristAttractions, onLocationUpdate, geofences }) => {
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        if (onLocationUpdate) {
          onLocationUpdate({
            lat: userPos.lat,
            lng: userPos.lng,
            address: `Live Location: ${userPos.lat.toFixed(6)}, ${userPos.lng.toFixed(6)}`
          });
        }
        
        alert(`Location found!\n\nLatitude: ${userPos.lat.toFixed(6)}\nLongitude: ${userPos.lng.toFixed(6)}`);
      },
      (error) => {
        alert(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '600px',
      backgroundColor: '#f1f5f9',
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, #e2e8f0 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, #cbd5e1 0%, transparent 50%)
      `
    }}>
      {/* Fallback Map Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        zIndex: 1
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
        <h3 style={{ 
          margin: '0 0 0.5rem 0', 
          color: '#1e293b', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Interactive Map
        </h3>
        <p style={{
          margin: '0',
          color: '#64748b',
          fontSize: '1rem',
          maxWidth: '400px'
        }}>
          Google Maps is currently unavailable. Using fallback location services.
        </p>
      </div>

      {/* Location Button */}
      <button
        onClick={getCurrentLocation}
        style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          transition: 'all 0.2s ease',
          marginBottom: '2rem'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        }}
      >
        📍 Get My Location
      </button>

      {/* Tourist Attractions List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h4 style={{
          margin: '0 0 1rem 0',
          color: '#1e293b',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          🎯 Popular Tourist Attractions in Delhi
        </h4>
        <div style={{
          display: 'grid',
          gap: '0.75rem',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {touristAttractions.map((attraction) => (
            <div key={attraction.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <span style={{ fontWeight: '600', color: '#374151' }}>
                {attraction.name}
              </span>
              <span style={{ 
                color: '#64748b', 
                fontSize: '0.8rem',
                fontFamily: 'monospace'
              }}>
                {attraction.lat.toFixed(4)}, {attraction.lng.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Geofences Info */}
      {geofences && geofences.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          padding: '1rem',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          maxWidth: '500px',
          width: '90%'
        }}>
          <h5 style={{
            margin: '0 0 0.5rem 0',
            color: '#dc2626',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            🚧 Active Monitoring Zones ({geofences.length})
          </h5>
          <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>
            {geofences.map(g => g.name).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

const CleanMap = ({ onLocationUpdate, showGeofencing = true }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [usesFallback, setUsesFallback] = useState(false);
  
  // Use hardcoded geofences from config file
  const geofences = GEOFENCES.filter(g => g.isActive);
  
  console.log('📍 Loaded hardcoded geofences:', geofences.length);

  // Set fallback timeout for Google Maps loading
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isMapLoading && hasValidApiKey) {
        console.warn('⏰ Google Maps loading timeout, switching to fallback');
        setMapError('Google Maps loading timeout. Using fallback map.');
        setUsesFallback(true);
        setIsMapLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isMapLoading, hasValidApiKey]);

  // Memoized styles and settings
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '600px',
    borderRadius: '12px',
    overflow: 'hidden'
  }), []);

  const center = useMemo(() => ({
    lat: 28.6139, // Delhi
    lng: 77.2090
  }), []);

  const zoom = useMemo(() => 12, []);

  // Tourist attractions in Delhi
  const touristAttractions = useMemo(() => [
    { id: 1, name: 'Red Fort', lat: 28.6562, lng: 77.2410, description: 'Historic Mughal fort and UNESCO World Heritage site' },
    { id: 2, name: 'India Gate', lat: 28.6129, lng: 77.2295, description: 'War memorial and iconic landmark' },
    { id: 3, name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, description: 'Bahái House of Worship known for its lotus shape' },
    { id: 4, name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, description: 'Medieval Islamic monument and UNESCO World Heritage site' },
    { id: 5, name: 'Humayun\'s Tomb', lat: 28.5933, lng: 77.2507, description: 'Mughal Emperor\'s tomb and architectural masterpiece' },
    { id: 6, name: 'Akshardham Temple', lat: 28.6127, lng: 77.2773, description: 'Modern Hindu temple complex' },
    { id: 7, name: 'Jama Masjid', lat: 28.6507, lng: 77.2334, description: 'One of India\'s largest mosques' },
    { id: 8, name: 'Raj Ghat', lat: 28.6407, lng: 77.2490, description: 'Memorial to Mahatma Gandhi' }
  ], []);

  // Get user's live location
  const getCurrentLocation = useCallback(() => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    console.log('Requesting location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location found:', position.coords);
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(userPos);
        
        // Reverse geocode to get address
        if (window.google && window.google.maps) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: userPos }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const address = results[0].formatted_address;
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: userPos.lat,
                  lng: userPos.lng,
                  address: address
                });
              }
            } else {
              if (onLocationUpdate) {
                onLocationUpdate({
                  lat: userPos.lat,
                  lng: userPos.lng,
                  address: 'Your Current Location'
                });
              }
            }
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'An unknown error occurred.';
            break;
        }
        
        setLocationError(errorMsg);
        
        // Fallback to default location (Delhi)
        if (onLocationUpdate) {
          onLocationUpdate({
            lat: center.lat,
            lng: center.lng,
            address: 'Delhi, India (Default)'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [center.lat, center.lng, onLocationUpdate]);

  // Handle map load success
  const onMapLoad = useCallback(() => {
    console.log('✅ Google Maps loaded successfully!');
    setIsMapLoading(false);
    setMapError(null);
    setUsesFallback(false);
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle map load error
  const onMapError = useCallback((error) => {
    console.error('❌ Google Maps failed to load:', error);
    setMapError('Google Maps failed to load. Using fallback map.');
    setIsMapLoading(false);
    setUsesFallback(true);
  }, []);

  // Check if API key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = apiKey && apiKey !== 'your_google_maps_api_key_here' && apiKey.length > 10;
  
  console.log('🗝️ Google Maps API Key status:', {
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    isValid: hasValidApiKey,
    keyPreview: apiKey ? `${apiKey.substring(0, 6)}...` : 'Missing'
  });

  const onMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Circle options for hardcoded geofences
  const getCircleOptions = useCallback((geofence) => ({
    strokeColor: geofence.color || '#ff0000',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: geofence.color || '#ff0000',
    fillOpacity: 0.2,
    clickable: true, // Allow clicking for info
    draggable: false,
    editable: false,
    visible: true
  }), []);

  // If API key is invalid or Google Maps failed, use fallback
  if (!hasValidApiKey || usesFallback) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {!hasValidApiKey && (
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
              ⚠️ Google Maps API Configuration Required
            </h4>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#a16207' }}>
              {!apiKey ? 'API key is missing from environment variables' : 'Invalid API key detected'}
            </p>
          </div>
        )}
        <FallbackMap 
          userLocation={userLocation}
          touristAttractions={touristAttractions}
          onLocationUpdate={onLocationUpdate}
          geofences={geofences}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Location Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <button
          onClick={getCurrentLocation}
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: userLocation ? '#22c55e' : '#007bff',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          📍 {userLocation ? 'Update Location' : 'Find My Location'}
        </button>
        
        {showGeofencing && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              fontWeight: '600',
              fontSize: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚧 {geofences.length} Red Zones Active
          </div>
        )}
        
        {locationError && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fontSize: '12px',
            color: '#dc2626',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '200px'
          }}>
            {locationError}
          </div>
        )}
      </div>
      <LoadScript 
        googleMapsApiKey={apiKey}
        onLoad={() => {
          console.log('✅ LoadScript: Google Maps JavaScript API loaded');
          setMapError(null);
        }}
        onError={(error) => {
          console.error('❌ LoadScript: Failed to load Google Maps JavaScript API:', error);
          onMapError(error);
        }}
        loadingElement={
          <div style={{
            height: '600px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 15px'
              }}></div>
              <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
                Loading Google Maps...
              </div>
              <div style={{ fontSize: '14px' }}>
                Please wait while we set up your map
              </div>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation || center}
          zoom={zoom}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            gestureHandling: 'cooperative',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'simplified' }]
              }
            ]
          }}
        >
          {/* Your current location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title='Your Current Location'
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                fillColor: '#007bff',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 4,
                scale: 12
              }}
            />
          )}

          {/* Tourist attraction markers */}
          {touristAttractions.map((attraction) => (
            <Marker
              key={attraction.id}
              position={{ lat: attraction.lat, lng: attraction.lng }}
              title={attraction.name}
              onClick={() => onMarkerClick(attraction)}
              icon={{
                path: window.google?.maps.SymbolPath.CIRCLE,
                fillColor: '#34d399',
                fillOpacity: 0.9,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 10
              }}
            />
          ))}

          {/* Geofence circles */}
          {geofences.map((geofence) => (
            <Circle
              key={geofence.id}
              center={{
                lat: geofence.latitude,
                lng: geofence.longitude
              }}
              radius={geofence.radius}
              options={getCircleOptions(geofence)}
            />
          ))}

          {/* Info window for selected marker */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={onInfoWindowClose}
            >
              <div style={{
                padding: '12px',
                minWidth: '200px',
                maxWidth: '300px'
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#1f2937',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  📍 {selectedMarker.name}
                </h3>
                <p style={{
                  margin: '0',
                  color: '#6b7280',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {selectedMarker.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Geofence Info */}
      {showGeofencing && geofences.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '16px' }}>
            🚧 Active Red Zones ({geofences.length})
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {geofences.map((geofence) => (
              <div key={geofence.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>{geofence.name}</span>
                <span style={{ color: '#6b7280' }}>{geofence.radius}m radius</span>
              </div>
            ))}
          </div>
          <p style={{ 
            margin: '10px 0 0 0', 
            fontSize: '12px', 
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            📝 To modify zones, edit the geofences.js config file
          </p>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CleanMap;