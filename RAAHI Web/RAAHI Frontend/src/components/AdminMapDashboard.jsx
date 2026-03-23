import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, Circle, HeatmapLayer } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import '../components/AdminDashboard.css';

const AdminMapDashboard = () => {
  const { isLoaded, loadError, apiKey } = useGoogleMaps();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(3);
  
  // Map states
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi
  const [mapZoom, setMapZoom] = useState(12);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapType, setMapType] = useState('roadmap'); // roadmap, satellite, hybrid, terrain
  
  // Data states
  const [tourists, setTourists] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalTourists: 1247,
    activeAlerts: 5,
    missingPersons: 1,
    iotDevicesOnline: 892
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '12px'
  };

  // Google Maps libraries to load
  const libraries = ['visualization', 'geometry'];

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock tourists with locations
    setTourists([
      {
        id: 'T001',
        name: 'John Doe',
        email: 'john@example.com',
        location: { lat: 28.6562, lng: 77.2410, name: 'Red Fort, Delhi' },
        status: 'safe',
        lastSeen: new Date(),
        digitalId: 'DID-001',
        verified: true,
        safetyScore: 95
      },
      {
        id: 'T002',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        location: { lat: 28.6129, lng: 77.2295, name: 'India Gate, Delhi' },
        status: 'alert',
        lastSeen: new Date(Date.now() - 30000),
        digitalId: 'DID-002',
        verified: true,
        safetyScore: 78
      },
      {
        id: 'T003',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        location: { lat: 28.5535, lng: 77.2588, name: 'Lotus Temple, Delhi' },
        status: 'safe',
        lastSeen: new Date(Date.now() - 120000),
        digitalId: 'DID-003',
        verified: true,
        safetyScore: 87
      },
      {
        id: 'T004',
        name: 'Lisa Wang',
        email: 'lisa@example.com',
        location: { lat: 28.5245, lng: 77.1855, name: 'Qutub Minar, Delhi' },
        status: 'missing',
        lastSeen: new Date(Date.now() - 3600000),
        digitalId: 'DID-004',
        verified: true,
        safetyScore: 45
      }
    ]);

    // Mock incidents
    setIncidents([
      {
        id: 'INC001',
        type: 'SOS Alert',
        severity: 'high',
        time: new Date(),
        location: { lat: 28.6129, lng: 77.2295, name: 'India Gate, Delhi' },
        status: 'active',
        touristId: 'T002',
        touristName: 'Sarah Smith',
        description: 'Tourist activated panic button'
      },
      {
        id: 'INC002',
        type: 'Geo-fence Breach',
        severity: 'medium',
        time: new Date(Date.now() - 600000),
        location: { lat: 28.6507, lng: 77.2334, name: 'Old Delhi Market' },
        status: 'resolved',
        touristId: 'T001',
        touristName: 'John Doe',
        description: 'Tourist exited safe zone'
      },
      {
        id: 'INC003',
        type: 'Missing Person',
        severity: 'critical',
        time: new Date(Date.now() - 3600000),
        location: { lat: 28.5245, lng: 77.1855, name: 'Qutub Minar, Delhi' },
        status: 'active',
        touristId: 'T004',
        touristName: 'Lisa Wang',
        description: 'No contact for over 1 hour'
      }
    ]);

    // Mock geofences
    setGeofences([
      {
        id: 'GF001',
        name: 'Red Fort Safe Zone',
        center: { lat: 28.6562, lng: 77.2410 },
        radius: 500,
        color: '#22c55e',
        type: 'safe',
        isActive: true
      },
      {
        id: 'GF002',
        name: 'India Gate Area',
        center: { lat: 28.6129, lng: 77.2295 },
        radius: 300,
        color: '#f59e0b',
        type: 'monitored',
        isActive: true
      },
      {
        id: 'GF003',
        name: 'Restricted Zone',
        center: { lat: 28.6507, lng: 77.2334 },
        radius: 200,
        color: '#ef4444',
        type: 'restricted',
        isActive: true
      }
    ]);
  };

  // Map marker icons based on status
  const getMarkerIcon = (status, type = 'tourist') => {
    const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
    
    if (type === 'incident') {
      switch (status) {
        case 'critical': return { url: iconBase + 'red-dot.png', scaledSize: new window.google.maps.Size(32, 32) };
        case 'high': return { url: iconBase + 'orange-dot.png', scaledSize: new window.google.maps.Size(28, 28) };
        case 'medium': return { url: iconBase + 'yellow-dot.png', scaledSize: new window.google.maps.Size(24, 24) };
        default: return { url: iconBase + 'blue-dot.png', scaledSize: new window.google.maps.Size(20, 20) };
      }
    }
    
    // Tourist markers
    switch (status) {
      case 'safe': return { 
        path: window.google?.maps.SymbolPath.CIRCLE,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 8
      };
      case 'alert': return {
        path: window.google?.maps.SymbolPath.CIRCLE,
        fillColor: '#f59e0b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 10
      };
      case 'missing': return {
        path: window.google?.maps.SymbolPath.CIRCLE,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12
      };
      default: return {
        path: window.google?.maps.SymbolPath.CIRCLE,
        fillColor: '#6b7280',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 8
      };
    }
  };

  // Circle options for geofences
  const getGeofenceOptions = (geofence) => ({
    strokeColor: geofence.color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: geofence.color,
    fillOpacity: 0.2,
    clickable: true,
    draggable: false,
    editable: false,
    visible: geofence.isActive
  });

  // Handle tourist marker click
  const handleTouristClick = (tourist) => {
    setSelectedTourist(tourist);
    setMapCenter(tourist.location);
    setMapZoom(15);
  };

  // Handle incident marker click
  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setMapCenter(incident.location);
    setMapZoom(15);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // In a real app, this would filter the tourists and incidents
  };

  // Render top navigation bar
  const renderTopBar = () => (
    <div className="admin-topbar">
      <div className="topbar-left">
        <h1 className="dashboard-title">🗺️ Admin Map Dashboard</h1>
      </div>
      <div className="topbar-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tourists, incidents, or locations..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>
      <div className="topbar-right">
        <div className="notification-icon" onClick={() => setNotifications(0)}>
          🔔
          {notifications > 0 && <span className="notification-badge">{notifications}</span>}
        </div>
        <div className="admin-profile">
          <img src="https://ui-avatars.com/api/?name=Admin&background=007bff&color=fff" alt="Admin" />
          <span>Admin</span>
        </div>
      </div>
    </div>
  );

  // Render map controls
  const renderMapControls = () => (
    <div className="map-controls">
      <div className="control-group">
        <label>Map Type:</label>
        <select value={mapType} onChange={(e) => setMapType(e.target.value)}>
          <option value="roadmap">Road Map</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybrid</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>
      
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
          />
          Show Heatmap
        </label>
      </div>
      
      <div className="zoom-controls">
        <button onClick={() => setMapZoom(prev => Math.min(prev + 1, 20))}>🔍+</button>
        <span>Zoom: {mapZoom}</span>
        <button onClick={() => setMapZoom(prev => Math.max(prev - 1, 1))}>🔍-</button>
      </div>
    </div>
  );

  // Render legend
  const renderLegend = () => (
    <div className="map-legend">
      <h4>Legend</h4>
      <div className="legend-section">
        <h5>Tourists:</h5>
        <div className="legend-item">
          <div className="legend-dot safe"></div>
          <span>Safe ({tourists.filter(t => t.status === 'safe').length})</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot alert"></div>
          <span>Alert ({tourists.filter(t => t.status === 'alert').length})</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot missing"></div>
          <span>Missing ({tourists.filter(t => t.status === 'missing').length})</span>
        </div>
      </div>
      
      <div className="legend-section">
        <h5>Zones:</h5>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#22c55e' }}></div>
          <span>Safe Zone</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Monitored</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ backgroundColor: '#ef4444' }}></div>
          <span>Restricted</span>
        </div>
      </div>
    </div>
  );

  // Show error state if Google Maps fails to load
  if (loadError || !apiKey) {
    return (
      <div className="admin-dashboard-container">
        {renderTopBar()}
        <div className="dashboard-body">
          <div className="error-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
            <h3 style={{ color: '#1e293b', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
              {!apiKey ? 'Google Maps API Key Missing' : 'Google Maps Loading Error'}
            </h3>
            <p style={{ color: '#64748b', maxWidth: '600px' }}>
              {!apiKey 
                ? 'No API key found in environment variables. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
                : `Error loading Google Maps: ${loadError}`
              }
            </p>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Dashboard Stats (Non-Map View)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <strong>Total Tourists:</strong> {stats.totalTourists}
                </div>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <strong>Active Alerts:</strong> {stats.activeAlerts}
                </div>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <strong>Missing Persons:</strong> {stats.missingPersons}
                </div>
                <div style={{ padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <strong>IoT Devices Online:</strong> {stats.iotDevicesOnline}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {renderTopBar()}
      
      <div className="dashboard-body">
        <div className="map-dashboard-content">
          {/* Map Controls */}
          {renderMapControls()}
          
          {/* Main Map */}
          <div className="main-map-container">
            {!isLoaded ? (
              <div className="map-loading">
                <div className="loading-spinner"></div>
                <p>Loading Admin Map Dashboard...</p>
              </div>
            ) : (
              <GoogleMap
                ref={mapRef}
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                mapTypeId={mapType}
                options={{
                  fullscreenControl: true,
                  streetViewControl: true,
                  mapTypeControl: true,
                  zoomControl: true,
                  gestureHandling: 'greedy'
                }}
              >
                {/* Tourist Markers */}
                {tourists.map(tourist => (
                  <Marker
                    key={tourist.id}
                    position={tourist.location}
                    title={`${tourist.name} (${tourist.status})`}
                    icon={getMarkerIcon(tourist.status)}
                    onClick={() => handleTouristClick(tourist)}
                  />
                ))}

                {/* Incident Markers */}
                {incidents.filter(incident => incident.status === 'active').map(incident => (
                  <Marker
                    key={incident.id}
                    position={incident.location}
                    title={`${incident.type} - ${incident.severity}`}
                    icon={getMarkerIcon(incident.severity, 'incident')}
                    onClick={() => handleIncidentClick(incident)}
                  />
                ))}

                {/* Geofence Circles */}
                {geofences.map(geofence => (
                  <Circle
                    key={geofence.id}
                    center={geofence.center}
                    radius={geofence.radius}
                    options={getGeofenceOptions(geofence)}
                  />
                ))}

                {/* Tourist Info Window */}
                {selectedTourist && (
                  <InfoWindow
                    position={selectedTourist.location}
                    onCloseClick={() => setSelectedTourist(null)}
                  >
                    <div className="info-window">
                      <h3>{selectedTourist.name}</h3>
                      <div className="tourist-details">
                        <p><strong>Status:</strong> <span className={`status ${selectedTourist.status}`}>{selectedTourist.status}</span></p>
                        <p><strong>ID:</strong> {selectedTourist.id}</p>
                        <p><strong>Digital ID:</strong> {selectedTourist.digitalId}</p>
                        <p><strong>Safety Score:</strong> {selectedTourist.safetyScore}%</p>
                        <p><strong>Last Seen:</strong> {selectedTourist.lastSeen.toLocaleString()}</p>
                        <p><strong>Location:</strong> {selectedTourist.location.name}</p>
                      </div>
                      <div className="info-actions">
                        <button className="btn-contact">📞 Contact</button>
                        <button className="btn-track">📍 Track</button>
                        {selectedTourist.status === 'alert' && (
                          <button className="btn-emergency">🚨 Emergency</button>
                        )}
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* Incident Info Window */}
                {selectedIncident && (
                  <InfoWindow
                    position={selectedIncident.location}
                    onCloseClick={() => setSelectedIncident(null)}
                  >
                    <div className="info-window">
                      <h3>{selectedIncident.type}</h3>
                      <div className="incident-details">
                        <p><strong>Severity:</strong> <span className={`severity ${selectedIncident.severity}`}>{selectedIncident.severity}</span></p>
                        <p><strong>Tourist:</strong> {selectedIncident.touristName}</p>
                        <p><strong>Time:</strong> {selectedIncident.time.toLocaleString()}</p>
                        <p><strong>Location:</strong> {selectedIncident.location.name}</p>
                        <p><strong>Description:</strong> {selectedIncident.description}</p>
                      </div>
                      <div className="info-actions">
                        <button className="btn-resolve">✅ Resolve</button>
                        <button className="btn-escalate">⚡ Escalate</button>
                        <button className="btn-dispatch">🚔 Dispatch</button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </div>
          
          {/* Map Legend */}
          {renderLegend()}
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #f8fafc;
        }

        .admin-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 25px;
          background: white;
          border-bottom: 2px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .dashboard-title {
          margin: 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-input {
          padding: 10px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          width: 300px;
          font-size: 14px;
        }

        .search-btn {
          padding: 10px 15px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .notification-icon {
          position: relative;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
        }

        .notification-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          font-size: 12px;
          padding: 2px 6px;
        }

        .admin-profile {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-profile img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .dashboard-body {
          flex: 1;
          overflow: hidden;
        }

        .map-dashboard-content {
          display: grid;
          grid-template-columns: 1fr 250px;
          grid-template-rows: auto 1fr;
          height: 100%;
          gap: 20px;
          padding: 20px;
        }

        .map-controls {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          gap: 20px;
          background: white;
          padding: 15px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-group select {
          padding: 6px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zoom-controls button {
          padding: 6px 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .main-map-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .map-loading {
          height: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .map-legend {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          height: fit-content;
        }

        .map-legend h4 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .legend-section {
          margin-bottom: 15px;
        }

        .legend-section h5 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          font-size: 13px;
          color: #6b7280;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .legend-dot.safe {
          background: #22c55e;
        }

        .legend-dot.alert {
          background: #f59e0b;
        }

        .legend-dot.missing {
          background: #ef4444;
        }

        .info-window {
          min-width: 200px;
          max-width: 300px;
        }

        .info-window h3 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 16px;
        }

        .tourist-details, .incident-details {
          margin-bottom: 15px;
        }

        .tourist-details p, .incident-details p {
          margin: 5px 0;
          font-size: 13px;
          color: #4b5563;
        }

        .status.safe { color: #22c55e; font-weight: 600; }
        .status.alert { color: #f59e0b; font-weight: 600; }
        .status.missing { color: #ef4444; font-weight: 600; }

        .severity.critical { color: #dc2626; font-weight: 600; }
        .severity.high { color: #ea580c; font-weight: 600; }
        .severity.medium { color: #d97706; font-weight: 600; }

        .info-actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }

        .info-actions button {
          padding: 6px 10px;
          font-size: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-contact { background: #007bff; color: white; }
        .btn-track { background: #22c55e; color: white; }
        .btn-emergency { background: #ef4444; color: white; }
        .btn-resolve { background: #22c55e; color: white; }
        .btn-escalate { background: #f59e0b; color: white; }
        .btn-dispatch { background: #6366f1; color: white; }

        @media (max-width: 1200px) {
          .map-dashboard-content {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
          }
          
          .map-legend {
            order: 2;
          }
          
          .main-map-container {
            order: 3;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminMapDashboard;