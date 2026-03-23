import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoadScript } from '@react-google-maps/api';

const GoogleMapsContext = createContext();

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

const libraries = ['places', 'geometry', 'visualization'];

export const GoogleMapsProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    // Get API key from environment
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    setApiKey(key);
  }, []);

  const handleLoad = () => {
    console.log('Google Maps API loaded successfully via context');
    setIsLoaded(true);
    setLoadError(null);
  };

  const handleError = (error) => {
    console.error('Google Maps API Error:', error);
    setLoadError(error.message || 'Failed to load Google Maps API');
    setIsLoaded(false);
  };

  const contextValue = {
    isLoaded,
    loadError,
    apiKey
  };

  // If no API key, render children without LoadScript
  if (!apiKey) {
    return (
      <GoogleMapsContext.Provider value={contextValue}>
        {children}
      </GoogleMapsContext.Provider>
    );
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      onLoad={handleLoad}
      onError={handleError}
      loadingElement={
        <GoogleMapsContext.Provider value={contextValue}>
          {children}
        </GoogleMapsContext.Provider>
      }
    >
      <GoogleMapsContext.Provider value={contextValue}>
        {children}
      </GoogleMapsContext.Provider>
    </LoadScript>
  );
};

export default GoogleMapsProvider;