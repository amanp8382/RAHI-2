import React, { useEffect, useRef, useState } from 'react';
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { hasValidCoordinates, isRecentLocation } from '../utils/locationValidation';
import usePredictionZones from '../utils/usePredictionZones';
import { classifyPrediction, predictionLocationKey } from '../utils/predictionZones';

const INDIA_BOUNDS = [[6.5, 68], [37.5, 98]];

function MapControls({ travelers, selection }) {
  const map = useMap();
  const initiallyFitted = useRef(false);
  useEffect(() => {
    if (!initiallyFitted.current && travelers.length) {
      map.fitBounds(travelers.map(t => [t.currentLocation.lat, t.currentLocation.lng]), { padding: [70, 70], maxZoom: 14 });
      initiallyFitted.current = true;
    }
  }, [map, travelers]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (selection?.kind === 'india') map.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
    if (selection?.kind === 'all' && travelers.length) {
      map.fitBounds(travelers.map(t => [t.currentLocation.lat, t.currentLocation.lng]), { padding: [45, 45], maxZoom: 14 });
    }
    if (selection?.kind === 'person') map.setView(selection.point, 15);
    // Live GPS updates move markers without taking the view away from the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selection]);
  return null;
}

export default function PoliceIndiaMap({ travelers, now }) {
  const [selection, setSelection] = useState(null);
  const [tileError, setTileError] = useState(false);
  const [zoneRadius, setZoneRadius] = useState(500);
  const [refreshToken, setRefreshToken] = useState(0);
  const predictions = usePredictionZones(travelers, refreshToken);
  const located = travelers.filter(t => hasValidCoordinates(t.currentLocation));
  const recentCount = located.filter(t => isRecentLocation(t.currentLocation, now)).length;
  const zones = located.map(t => classifyPrediction(predictions[predictionLocationKey(t.currentLocation)]?.prediction, predictions[predictionLocationKey(t.currentLocation)]?.receivedAt, now));
  const greenCount = zones.filter(zone => zone?.label === 'Green zone').length;
  const redCount = zones.filter(zone => zone?.label === 'Red zone').length;
  const errorCount = Object.values(predictions).filter(entry => entry.error).length;
  return (
    <div className="police-india-map">
      <div className="police-map-toolbar">
        <span>{recentCount} recent / {located.length - recentCount} last known / {travelers.length - located.length} without GPS</span>
        <div>
          <label className="police-zone-radius">Zone radius{' '}
            <select value={zoneRadius} onChange={event => setZoneRadius(Number(event.target.value))}>
              <option value={250}>250 m</option><option value={500}>500 m</option><option value={1000}>1 km</option>
            </select>
          </label>
          <button type="button" onClick={() => setRefreshToken(value => value + 1)}>Retry predictions</button>
          <button type="button" onClick={() => setSelection({ kind: 'india' })}>India view</button>
          <button type="button" disabled={!located.length} onClick={() => setSelection({ kind: 'all' })}>Fit people</button>
        </div>
      </div>
      <MapContainer bounds={INDIA_BOUNDS} boundsOptions={{ padding: [20, 20] }} minZoom={3}
        className="police-map-canvas" aria-label="India map showing reported traveler locations">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{ tileerror: () => setTileError(true) }} />
        <MapControls travelers={located} selection={selection} />
        {located.map(traveler => {
          const location = traveler.currentLocation;
          const recent = isRecentLocation(location, now);
          const entry = predictions[predictionLocationKey(location)];
          const zone = classifyPrediction(entry?.prediction, entry?.receivedAt, now);
          const color = zone?.color || (recent ? '#2563eb' : '#64748b');
          return (
            <React.Fragment key={traveler.id}>
              {zone && (
                <Circle center={[location.lat, location.lng]} radius={zoneRadius}
                  pathOptions={{ color: zone.color, weight: 2, fillColor: zone.color, fillOpacity: .25, dashArray: recent ? undefined : '6 5' }}>
                  <Popup>
                    <strong>{zone.label}: {traveler.name}</strong><br />
                    Model score: {zone.score}/100<br />
                    {recent ? 'Recent GPS position' : 'Last-known GPS position (not live)'}<br />
                    Radius: {zoneRadius} m (display setting)<br />
                    Prediction updated: {new Date(entry.receivedAt).toLocaleString()}<br />
                    Model label: {entry.prediction.threatLevel || 'Not provided'}<br />
                    Based on the center location only; surrounding streets have not been individually assessed.
                  </Popup>
                </Circle>
              )}
              {zone && (
                <CircleMarker center={[location.lat, location.lng]} radius={20}
                  pathOptions={{ color: zone.color, weight: 3, fillColor: zone.color, fillOpacity: .2, dashArray: recent ? undefined : '4 3' }}
                  eventHandlers={{ click: () => setSelection({ kind: 'person', point: [location.lat, location.lng] }) }} />
              )}
              {Number.isFinite(location.accuracy) && location.accuracy > 0 && (
                <Circle center={[location.lat, location.lng]} radius={location.accuracy}
                  pathOptions={{ color, weight: 1, fillOpacity: .08 }} interactive={false} />
              )}
              <CircleMarker center={[location.lat, location.lng]} radius={9}
                pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}>
                <Popup>
                  <strong>{traveler.name}</strong><br />
                  {traveler.id}<br />
                  {zone ? `${zone.label} - model score ${zone.score}/100` : entry?.error || (entry?.loading ? 'Calculating zone...' : 'Zone unclassified')}<br />
                  {recent ? 'Recent GPS update' : 'Last known location'}<br />
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}<br />
                  Updated: {Number.isFinite(Date.parse(location.updatedAt)) ? new Date(location.updatedAt).toLocaleString() : 'Unknown'}<br />
                  Accuracy: {Number.isFinite(location.accuracy) ? `${Math.round(location.accuracy)} m` : 'Not reported'}
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
      <p className="police-zone-status" role="status">
        {greenCount} green / {redCount} red / {located.length - greenCount - redCount} unclassified.
        {errorCount > 0 ? ` ${errorCount} prediction requests failed. Check that the backend is running and select Retry predictions.` : located.length > greenCount + redCount ? ' Loading model predictions...' : ''}
      </p>
      {tileError && <p role="status">Map tiles could not load. Check your internet connection; reported coordinates are listed below.</p>}
      {!located.length && <p role="status">No GPS locations have been shared. Travelers must allow location access on their dashboard.</p>}
      <div className="police-map-legend">
        <span className="police-zone-green">Green: model score 60-100</span>
        <span className="police-zone-red">Red: model score below 60</span>
        <span>Dashed ring: last-known GPS</span><span>Blue/grey: waiting for prediction</span>
      </div>
      <p className="police-map-note">Locations sync from MongoDB every 10 seconds. Zones refresh every minute using the current scoring model. Last-known positions retain zones with dashed outlines; they are not live GPS. Missing or expired predictions are unclassified. Colored halos remain visible at India zoom; select a traveler to inspect the actual zone. Circles extend the center prediction visually; the radius is not learned by the model.</p>
      <div className="police-map-people">
        {located.map(traveler => (
          <button type="button" key={traveler.id} onClick={() => setSelection({ kind: 'person', point: [traveler.currentLocation.lat, traveler.currentLocation.lng] })}>
            <strong>{traveler.name}</strong><span>{traveler.currentLocation.lat.toFixed(4)}, {traveler.currentLocation.lng.toFixed(4)}</span>
            <span>{predictions[predictionLocationKey(traveler.currentLocation)]?.error || (classifyPrediction(predictions[predictionLocationKey(traveler.currentLocation)]?.prediction, predictions[predictionLocationKey(traveler.currentLocation)]?.receivedAt, now)?.label ?? 'Calculating zone...')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
