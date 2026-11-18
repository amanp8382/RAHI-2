import { useEffect, useRef, useState } from 'react';
import apiService from '../services/api';
import { hasValidCoordinates } from './locationValidation';
import { predictionLocationKey } from './predictionZones';

export default function usePredictionZones(travelers, refreshToken = 0) {
  const cache = useRef(new Map());
  const [entries, setEntries] = useState({});
  const [tick, setTick] = useState(0);
  // Stable primitive dependency: a one-second clock tick must not restart HTTP requests.
  const signature = JSON.stringify([...new Map(travelers
    .filter(t => hasValidCoordinates(t.currentLocation))
    .map(t => [predictionLocationKey(t.currentLocation), {
      key: predictionLocationKey(t.currentLocation),
      lat: t.currentLocation.lat, lng: t.currentLocation.lng
    }])).values()].map(p => ({ ...p, lat: Number(p.key.split(',')[0]), lng: Number(p.key.split(',')[1]) }))
    .sort((a, b) => a.key.localeCompare(b.key)));

  useEffect(() => {
    const timer = setInterval(() => setTick(value => value + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const points = JSON.parse(signature);
    const activeKeys = new Set(points.map(p => p.key));
    for (const key of cache.current.keys()) if (!activeKeys.has(key)) cache.current.delete(key);
    const controller = new AbortController();
    let cursor = 0;
    const publish = () => {
      if (!controller.signal.aborted) setEntries(Object.fromEntries(cache.current));
    };
    const worker = async () => {
      while (cursor < points.length && !controller.signal.aborted) {
        const point = points[cursor++];
        const previous = cache.current.get(point.key);
        if (previous?.prediction && Date.now() - previous.receivedAt < 60000) continue;
        cache.current.set(point.key, { loading: true });
        publish();
        try {
          const response = await apiService.ai.getLiveSafetyScore({ lat: point.lat, lng: point.lng, locationName: '' }, { signal: controller.signal });
          if (controller.signal.aborted) return;
          cache.current.set(point.key, { prediction: response.prediction, receivedAt: Date.now() });
        } catch {
          if (controller.signal.aborted) return;
          cache.current.set(point.key, { error: 'Prediction unavailable. Retrying automatically.' });
        }
        publish();
      }
    };
    publish();
    // Bound Python process count; people sharing a coordinate reuse the same prediction.
    void Promise.all([worker(), worker()]);
    return () => controller.abort();
  }, [signature, tick, refreshToken]);

  return entries;
}
