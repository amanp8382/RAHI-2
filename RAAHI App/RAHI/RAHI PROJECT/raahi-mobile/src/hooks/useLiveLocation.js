import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { storage } from '../services/storage';

export default function useLiveLocation(enabled = true) {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('Requesting live location...');
  const [error, setError] = useState('');
  const subscriptionRef = useRef(null);

  useEffect(() => {
    let active = true;

    const startTracking = async () => {
      if (!enabled) return;

      try {
        const saved = await storage.getLiveLocation();
        if (saved && active) {
          setLocation(saved);
        }

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          if (active) {
            setStatus('Location permission denied');
            setError('Allow location access to get live safety prediction.');
          }
          return;
        }

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 15
          },
          async (nextPosition) => {
            const nextLocation = {
              latitude: nextPosition.coords.latitude,
              longitude: nextPosition.coords.longitude,
              accuracy: nextPosition.coords.accuracy,
              timestamp: nextPosition.timestamp
            };
            await storage.setLiveLocation(nextLocation);
            if (active) {
              setLocation(nextLocation);
              setStatus(
                `Live location active (${nextLocation.latitude.toFixed(4)}, ${nextLocation.longitude.toFixed(4)})`
              );
              setError('');
            }
          }
        );
      } catch (locationError) {
        if (active) {
          setStatus('Live location unavailable');
          setError(locationError.message || 'Unable to access live location.');
        }
      }
    };

    startTracking();

    return () => {
      active = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [enabled]);

  return { location, status, error };
}
