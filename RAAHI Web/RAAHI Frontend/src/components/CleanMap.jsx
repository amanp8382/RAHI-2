import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';

// Fallback component when API fails
const MapFallback = ({ touristAttractions, onLocationUpdate }) => {
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
            address: `Location: ${userPos.lat.toFixed(6)}, ${userPos.lng.toFixed(6)}`
          });
        }
        
        alert(`Location found!\nLatitude: ${userPos.lat.toFixed(6)}\nLongitude: ${userPos.lng.toFixed(6)}`);
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
      backgroundColor: '#f8fafc',
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
        <h3 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '600' }}>
          Map Service Unavailable
        </h3>
        <p style={{ color: '#64748b', maxWidth: '400px' }}>
          Google Maps API is not properly configured. Please enable the required APIs in Google Cloud Console.
        </p>
      </div>

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
          marginBottom: '2rem'
        }}
      >
        📍 Get My Location
      </button>

      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>
          🎯 Popular Tourist Attractions in Delhi
        </h4>
        <div style={{ display: 'grid', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
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
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                {attraction.lat.toFixed(4)}, {attraction.lng.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CleanMap = ({ onLocationUpdate }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const { isLoaded, loadError, apiKey } = useGoogleMaps();

  // Map settings
  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
  };

  const center = {
    lat: 28.6139, // Delhi
    lng: 77.2090
  };

  // Tourist attractions in Delhi
  const touristAttractions = [
    { id: 1, name: 'Red Fort', lat: 28.6562, lng: 77.2410, description: 'Historic Mughal fort and UNESCO World Heritage site' },
    { id: 2, name: 'India Gate', lat: 28.6129, lng: 77.2295, description: 'War memorial and iconic landmark' },
    { id: 3, name: 'Lotus Temple', lat: 28.5535, lng: 77.2588, description: 'Bahái House of Worship known for its lotus shape' },
    { id: 4, name: 'Qutub Minar', lat: 28.5245, lng: 77.1855, description: 'Medieval Islamic monument and UNESCO World Heritage site' },
    { id: 5, name: "Humayun's Tomb", lat: 28.5933, lng: 77.2507, description: "Mughal Emperor's tomb and architectural masterpiece" },
    { id: 6, name: 'Akshardham Temple', lat: 28.6127, lng: 77.2773, description: 'Modern Hindu temple complex' },
    { id: 7, name: 'Jama Masjid', lat: 28.6507, lng: 77.2334, description: "One of India's largest mosques" },
    { id: 8, name: 'Raj Ghat', lat: 28.6407, lng: 77.2490, description: 'Memorial to Mahatma Gandhi' }
  ];

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
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
        setUserLocation(userPos);
        
        if (onLocationUpdate) {
          onLocationUpdate({
            lat: userPos.lat,
            lng: userPos.lng,
            address: 'Your Current Location'
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please allow location access.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [onLocationUpdate]);

  // Handle map load
  const onMapLoad = useCallback(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Handle marker click
  const onMarkerClick = useCallback((attraction) => {
    setSelectedMarker(attraction);
  }, []);

  // Handle info window close
  const onInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Add debug logging
  console.log('CleanMap render state:', { isLoaded, loadError, apiKey: !!apiKey });
  
  // If API error or no API key, show fallback
  if (loadError || !apiKey) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {!apiKey && (
          <div style={{
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>
              ⚠️ Google Maps API Key Missing
            </h4>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#a16207' }}>
              No API key found in environment variables. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
            </p>
          </div>
        )}
        {loadError && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>
              ❌ Google Maps API Error
            </h4>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#b91c1c' }}>
              {String(loadError)}
            </p>
          </div>
        )}
        <MapFallback 
          touristAttractions={touristAttractions}
          onLocationUpdate={onLocationUpdate}
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Location Button */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
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
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          📍 {userLocation ? 'Update Location' : 'Find My Location'}
        </button>
      </div>

      {!isLoaded ? (
        <div style={{ 
          height: '600px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#f8fafc', 
          borderRadius: '12px',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading Google Maps...
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || center}
          zoom={12}
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              title="Your Current Location"
            />
          )}

          {/* Tourist attraction markers */}
          {touristAttractions.map((attraction) => (
            <Marker
              key={attraction.id}
              position={{ lat: attraction.lat, lng: attraction.lng }}
              title={attraction.name}
              onClick={() => onMarkerClick(attraction)}
            />
          ))}

          {/* Info window for selected attraction */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={onInfoWindowClose}
            >
              <div style={{ padding: '10px', maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {selectedMarker.name}
                </h3>
                <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                  {selectedMarker.description}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default CleanMap;