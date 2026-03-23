import React, { useState, useEffect } from 'react';

const GeofenceConfig = ({ onGeofenceUpdate, existingGeofences = [], userLocation = null }) => {
  const [geofences, setGeofences] = useState(existingGeofences);
  const [isCreating, setIsCreating] = useState(false);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '100', // default 100 meters
    color: '#ff0000',
    isActive: true
  });

  // Predefined locations for quick setup
  const quickLocations = [
    { name: 'Red Fort', lat: 28.6562, lng: 77.2410 },
    { name: 'India Gate', lat: 28.6129, lng: 77.2295 },
    { name: 'Lotus Temple', lat: 28.5535, lng: 77.2588 },
    { name: 'Qutub Minar', lat: 28.5245, lng: 77.1855 },
    { name: 'Current Location', lat: userLocation?.lat || 28.6139, lng: userLocation?.lng || 77.2090 }
  ];

  useEffect(() => {
    if (onGeofenceUpdate) {
      onGeofenceUpdate(geofences);
    }
  }, [geofences, onGeofenceUpdate]);

  const handleInputChange = (field, value) => {
    setNewGeofence(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickLocation = (location) => {
    setNewGeofence(prev => ({
      ...prev,
      name: prev.name || `Geofence at ${location.name}`,
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    }));
  };

  const validateGeofence = () => {
    const lat = parseFloat(newGeofence.latitude);
    const lng = parseFloat(newGeofence.longitude);
    const radius = parseFloat(newGeofence.radius);

    if (!newGeofence.name.trim()) return 'Name is required';
    if (isNaN(lat) || lat < -90 || lat > 90) return 'Invalid latitude (-90 to 90)';
    if (isNaN(lng) || lng < -180 || lng > 180) return 'Invalid longitude (-180 to 180)';
    if (isNaN(radius) || radius < 10 || radius > 10000) return 'Radius must be between 10m and 10km';

    return null;
  };

  const handleCreateGeofence = () => {
    const error = validateGeofence();
    if (error) {
      alert(error);
      return;
    }

    const geofence = {
      id: Date.now().toString(),
      name: newGeofence.name.trim(),
      latitude: parseFloat(newGeofence.latitude),
      longitude: parseFloat(newGeofence.longitude),
      radius: parseFloat(newGeofence.radius),
      color: newGeofence.color,
      isActive: newGeofence.isActive,
      createdAt: new Date().toISOString()
    };

    setGeofences(prev => [...prev, geofence]);
    setNewGeofence({
      name: '',
      latitude: '',
      longitude: '',
      radius: '100',
      color: '#ff0000',
      isActive: true
    });
    setIsCreating(false);
  };

  const handleDeleteGeofence = (id) => {
    if (confirm('Are you sure you want to delete this geofence?')) {
      setGeofences(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleToggleGeofence = (id) => {
    setGeofences(prev => 
      prev.map(g => 
        g.id === id ? { ...g, isActive: !g.isActive } : g
      )
    );
  };

  return (
    <div className="geofence-config">
      <div className="geofence-header">
        <h3>🚧 Geofence Management</h3>
        <button 
          className="btn-create-geofence"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✕ Cancel' : '+ Add Geofence'}
        </button>
      </div>

      {isCreating && (
        <div className="geofence-creator">
          <div className="creator-header">
            <h4>Create New Geofence</h4>
            <p>Define a circular area to monitor tourist movement</p>
          </div>

          <div className="form-group">
            <label>Geofence Name</label>
            <input
              type="text"
              placeholder="e.g., Red Fort Safe Zone"
              value={newGeofence.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="quick-locations">
            <label>Quick Locations</label>
            <div className="location-buttons">
              {quickLocations.map((location, index) => (
                <button
                  key={index}
                  className="quick-location-btn"
                  onClick={() => handleQuickLocation(location)}
                  type="button"
                >
                  📍 {location.name}
                </button>
              ))}
            </div>
          </div>

          <div className="coordinates-group">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="0.000001"
                placeholder="28.6139"
                value={newGeofence.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="0.000001"
                placeholder="77.2090"
                value={newGeofence.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Radius (meters)</label>
            <input
              type="number"
              min="10"
              max="10000"
              placeholder="100"
              value={newGeofence.radius}
              onChange={(e) => handleInputChange('radius', e.target.value)}
            />
            <small>Range: 10m - 10km</small>
          </div>

          <div className="form-group">
            <label>Circle Color</label>
            <div className="color-selector">
              <input
                type="color"
                value={newGeofence.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
              />
              <span>Choose fence color on map</span>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn-create"
              onClick={handleCreateGeofence}
            >
              ✅ Create Geofence
            </button>
            <button 
              className="btn-cancel"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="existing-geofences">
        <h4>Active Geofences ({geofences.length})</h4>
        {geofences.length === 0 ? (
          <div className="no-geofences">
            <p>🚧 No geofences created yet</p>
            <p>Create your first geofence to monitor tourist movement</p>
          </div>
        ) : (
          <div className="geofences-list">
            {geofences.map((geofence) => (
              <div key={geofence.id} className={`geofence-item ${!geofence.isActive ? 'inactive' : ''}`}>
                <div className="geofence-info">
                  <div className="geofence-name">
                    <span 
                      className="color-indicator" 
                      style={{ backgroundColor: geofence.color }}
                    ></span>
                    {geofence.name}
                  </div>
                  <div className="geofence-details">
                    <span>📍 {geofence.latitude.toFixed(4)}, {geofence.longitude.toFixed(4)}</span>
                    <span>📏 {geofence.radius}m radius</span>
                  </div>
                </div>
                <div className="geofence-actions">
                  <button
                    className={`toggle-btn ${geofence.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleGeofence(geofence.id)}
                    title={geofence.isActive ? 'Disable' : 'Enable'}
                  >
                    {geofence.isActive ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteGeofence(geofence.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="geofence-info-panel">
        <h4>ℹ️ How Geofencing Works</h4>
        <ul>
          <li><strong>Red circles</strong> show geofence boundaries on the map</li>
          <li><strong>Alerts</strong> trigger when tourists enter/exit these areas</li>
          <li><strong>Radius</strong> can be 10 meters to 10 kilometers</li>
          <li><strong>Real-time monitoring</strong> tracks all tourist movement</li>
          <li><strong>Multiple zones</strong> can overlap for complex monitoring</li>
        </ul>
      </div>

      <style jsx>{`
        .geofence-config {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .geofence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f1f5f9;
        }

        .geofence-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 20px;
          font-weight: 600;
        }

        .btn-create-geofence {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-create-geofence:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .geofence-creator {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .creator-header h4 {
          margin: 0 0 5px 0;
          color: #1f2937;
          font-size: 18px;
        }

        .creator-header p {
          margin: 0 0 20px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #007bff;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .quick-locations {
          margin-bottom: 20px;
        }

        .location-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .quick-location-btn {
          padding: 8px 12px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .quick-location-btn:hover {
          border-color: #007bff;
          background: #f0f7ff;
        }

        .coordinates-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .color-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .color-selector input[type="color"] {
          width: 40px;
          height: 40px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-create {
          padding: 12px 24px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-create:hover {
          background: #16a34a;
        }

        .btn-cancel {
          padding: 12px 24px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #4b5563;
        }

        .existing-geofences h4 {
          margin: 20px 0 15px 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .no-geofences {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .no-geofences p:first-child {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .geofences-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .geofence-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .geofence-item.inactive {
          opacity: 0.6;
          background: #f9fafb;
        }

        .geofence-item:hover {
          border-color: #007bff;
        }

        .geofence-name {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .color-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
        }

        .geofence-details {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #6b7280;
        }

        .geofence-actions {
          display: flex;
          gap: 5px;
        }

        .toggle-btn, .delete-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .toggle-btn.active {
          background: #22c55e;
        }

        .toggle-btn.inactive {
          background: #6b7280;
        }

        .delete-btn {
          background: #ef4444;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .geofence-info-panel {
          background: #f0f7ff;
          border: 2px solid #bfdbfe;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }

        .geofence-info-panel h4 {
          margin: 0 0 10px 0;
          color: #1e40af;
          font-size: 14px;
        }

        .geofence-info-panel ul {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
          font-size: 13px;
          line-height: 1.5;
        }

        .geofence-info-panel li {
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .coordinates-group {
            grid-template-columns: 1fr;
          }
          
          .geofence-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .geofence-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default GeofenceConfig;