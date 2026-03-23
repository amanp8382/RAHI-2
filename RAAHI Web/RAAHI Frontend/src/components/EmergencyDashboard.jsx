import React, { useEffect, useMemo, useState } from 'react';
import { getAllTravelerRecords } from '../utils/travelerLedger';
import { getAllTravelerLiveLocations } from '../utils/liveLocationStore';
import './EmergencyDashboard.css';

const SAFE_ZONES = [
  { id: 'safe-1', label: 'Safe Zone A', cx: 140, cy: 100, r: 56, color: 'rgba(34, 197, 94, 0.28)' },
  { id: 'safe-2', label: 'Safe Zone B', cx: 340, cy: 95, r: 50, color: 'rgba(34, 197, 94, 0.28)' },
  { id: 'safe-3', label: 'Safe Zone C', cx: 470, cy: 170, r: 60, color: 'rgba(34, 197, 94, 0.28)' }
];

const DANGER_ZONES = [
  { id: 'danger-1', label: 'Red Alert Zone', x: 250, y: 225, width: 120, height: 72, color: 'rgba(239, 68, 68, 0.32)' },
  { id: 'danger-2', label: 'Restricted Zone', x: 88, y: 215, width: 92, height: 58, color: 'rgba(220, 38, 38, 0.28)' }
];

const buildRiskLevel = (record) => {
  if (record.medicalConditions && record.medicalConditions.toLowerCase() !== 'none') return 'high';
  if (Number(record.tripDurationDays || 0) >= 7) return 'medium';
  return 'low';
};

const buildStatus = (record) => {
  if (!record.phone) return 'offline';
  if (buildRiskLevel(record) === 'high') return 'emergency';
  return 'active';
};

const buildMockPoint = (index) => {
  const points = [
    { x: 150, y: 110 },
    { x: 315, y: 110 },
    { x: 460, y: 170 },
    { x: 305, y: 258 },
    { x: 135, y: 235 }
  ];
  return points[index % points.length];
};

const projectToMap = (lat, lng) => {
  const minLat = 28.45;
  const maxLat = 28.75;
  const minLng = 76.95;
  const maxLng = 77.35;

  const normalizedX = (lng - minLng) / (maxLng - minLng);
  const normalizedY = (lat - minLat) / (maxLat - minLat);

  return {
    x: Math.min(560, Math.max(40, 40 + normalizedX * 520)),
    y: Math.min(320, Math.max(40, 320 - normalizedY * 260))
  };
};

const EmergencyDashboard = ({ travelerRecords = null, viewerLabel = 'System Admin' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [locationTick, setLocationTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLocationTick((value) => value + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const liveTravelers = useMemo(() => {
    const source = travelerRecords ?? getAllTravelerRecords();
    const liveLocations = getAllTravelerLiveLocations();
    return source.map((record, index) => {
      const liveLocation = liveLocations[record.travelerId];
      const point = liveLocation?.lat && liveLocation?.lng
        ? projectToMap(liveLocation.lat, liveLocation.lng)
        : buildMockPoint(index);
      return {
        id: record.travelerId,
        name: record.fullName || 'Unnamed traveler',
        email: record.email || 'No email added',
        phone: record.phone || 'Not provided',
        destination: record.destination || 'Unknown destination',
        tripDurationDays: record.tripDurationDays || 0,
        bloodGroup: record.bloodGroup || 'Unknown',
        medicalConditions: record.medicalConditions || 'None shared',
        aadhaarMasked: record.aadhaarMasked || 'Not provided',
        aadhaarVerified: Boolean(record.aadhaarVerified),
        updatedAt: record.updatedAt || record.issuedAt || new Date().toISOString(),
        riskLevel: buildRiskLevel(record),
        status: buildStatus(record),
        currentLocation: {
          address: liveLocation?.address || record.destination || 'Live route not shared',
          lat: liveLocation?.lat || null,
          lng: liveLocation?.lng || null,
          accuracy: liveLocation?.accuracy || null,
          updatedAt: liveLocation?.updatedAt || record.updatedAt || record.issuedAt || new Date().toISOString(),
          x: point.x,
          y: point.y
        }
      };
    });
  }, [travelerRecords, locationTick]);

  const filteredTravelers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return liveTravelers;

    return liveTravelers.filter((traveler) => (
      traveler.name.toLowerCase().includes(query) ||
      traveler.email.toLowerCase().includes(query) ||
      traveler.phone.includes(query) ||
      traveler.id.toLowerCase().includes(query) ||
      traveler.destination.toLowerCase().includes(query)
    ));
  }, [liveTravelers, searchTerm]);

  const stats = useMemo(() => ({
    totalTravelers: liveTravelers.length,
    activeAlerts: liveTravelers.filter((traveler) => traveler.riskLevel === 'high').length,
    safeZones: SAFE_ZONES.length,
    redZones: DANGER_ZONES.length
  }), [liveTravelers]);

  const recentAlerts = useMemo(() => (
    liveTravelers
      .filter((traveler) => traveler.riskLevel !== 'low')
      .slice(0, 4)
      .map((traveler, index) => ({
        id: `alert-${traveler.id}`,
        type: traveler.riskLevel === 'high' ? 'Medical Watch' : 'Extended Trip Monitor',
        severity: traveler.riskLevel,
        location: traveler.destination,
        tourist: traveler.name,
        time: traveler.updatedAt,
        status: index === 0 ? 'active' : 'monitoring'
      }))
  ), [liveTravelers]);

  useEffect(() => {
    setNotifications(recentAlerts.length);
  }, [recentAlerts.length]);

  const formatTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
  };

  const renderOverview = () => (
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon blue">Users</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalTravelers}</div>
              <div className="stat-title">Registered Travelers</div>
              <div className="stat-subtitle">Live saved records</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">SOS</div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeAlerts}</div>
              <div className="stat-title">High-Risk Travelers</div>
              <div className="stat-subtitle">Health or risk watch</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon green">Safe</div>
            <div className="stat-info">
              <div className="stat-value">{stats.safeZones}</div>
              <div className="stat-title">Green Zones</div>
              <div className="stat-subtitle">Safe movement areas</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">Red</div>
            <div className="stat-info">
              <div className="stat-value">{stats.redZones}</div>
              <div className="stat-title">Red Zones</div>
              <div className="stat-subtitle">High alert areas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card heatmap-card">
          <div className="card-header">
            <h3>Police Zone Map</h3>
            <p>Green zones are safe. Red zones require immediate watch.</p>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-display">
              <svg viewBox="0 0 600 350" className="heatmap-svg">
                {SAFE_ZONES.map((zone) => (
                  <g key={zone.id}>
                    <circle cx={zone.cx} cy={zone.cy} r={zone.r} fill={zone.color} stroke="#16a34a" strokeWidth="2" />
                    <text x={zone.cx} y={zone.cy} textAnchor="middle" fill="#166534" fontSize="12" fontWeight="700">{zone.label}</text>
                  </g>
                ))}

                {DANGER_ZONES.map((zone) => (
                  <g key={zone.id}>
                    <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx="10" fill={zone.color} stroke="#dc2626" strokeWidth="2" />
                    <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2} textAnchor="middle" fill="#991b1b" fontSize="12" fontWeight="700">{zone.label}</text>
                  </g>
                ))}

                {liveTravelers.map((traveler) => (
                  <g key={traveler.id}>
                    <circle cx={traveler.currentLocation.x} cy={traveler.currentLocation.y} r="5" fill={traveler.riskLevel === 'high' ? '#dc2626' : '#16a34a'} stroke="#ffffff" strokeWidth="2" />
                    <text x={traveler.currentLocation.x + 8} y={traveler.currentLocation.y - 8} fill="#1f2937" fontSize="11" fontWeight="700">
                      {traveler.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="heatmap-legend">
              <div className="legend-item">
                <div className="legend-dot safe"></div>
                <span>Green Safe Zone</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot danger"></div>
                <span>Red Alert Zone</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot tourist"></div>
                <span>Traveler Position</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3>Live Registered Traveler Alerts</h3>
            <p>Generated from the latest traveler records</p>
          </div>
          <div className="alerts-container">
            {recentAlerts.length > 0 ? recentAlerts.map((alert) => (
              <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                <div className="alert-header">
                  <div className="alert-type">{alert.type}</div>
                  <div className="alert-time">{formatTime(alert.time)}</div>
                </div>
                <div className="alert-location">Location: {alert.location}</div>
                <div className="alert-tourist">Traveler: {alert.tourist}</div>
                <div className="alert-footer">
                  <div className={`alert-status status-${alert.status}`}>{alert.status}</div>
                </div>
              </div>
            )) : (
              <div className="alert-card severity-low">
                <div className="alert-header">
                  <div className="alert-type">No critical alerts</div>
                </div>
                <div className="alert-tourist">All currently saved travelers are in low-risk state.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTravelers = () => (
    <div className="tourist-management">
      <div className="management-controls">
        <div className="search-section">
          <div className="search-container-advanced">
            <input
              type="text"
              placeholder="Search registered travelers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="tourist-search-input"
            />
            <button className="search-btn-advanced">Search</button>
          </div>
        </div>
      </div>

      <div className="tourists-grid">
        {filteredTravelers.map((traveler) => (
          <div key={traveler.id} className={`tourist-card ${traveler.status}`}>
            <div className="tourist-header">
              <div className="tourist-info">
                <div className="tourist-id">{traveler.id}</div>
                <div className="tourist-name">{traveler.name}</div>
                <div className="tourist-email">{traveler.email}</div>
              </div>
              <div className="tourist-status-badges">
                <div className={`status-badge ${traveler.status}`}>{traveler.status}</div>
                <div className={`risk-badge ${traveler.riskLevel}`}>{traveler.riskLevel} risk</div>
              </div>
            </div>

            <div className="tourist-details">
              <div className="detail-item"><span className="detail-icon">Phone</span><span>{traveler.phone}</span></div>
              <div className="detail-item"><span className="detail-icon">Destination</span><span>{traveler.destination}</span></div>
              <div className="detail-item"><span className="detail-icon">Blood</span><span>{traveler.bloodGroup}</span></div>
              <div className="detail-item"><span className="detail-icon">Health</span><span>{traveler.medicalConditions}</span></div>
            </div>

            <div className="location-info">
              <div className="location-header">
                <span className="location-title">Latest Record</span>
              </div>
              <div className="location-address">{traveler.currentLocation.address}</div>
              <div className="location-update">Updated: {formatTime(traveler.currentLocation.updatedAt)}</div>
              <div className="location-update">
                {traveler.currentLocation.lat && traveler.currentLocation.lng
                  ? `Live: ${traveler.currentLocation.lat.toFixed(5)}, ${traveler.currentLocation.lng.toFixed(5)}`
                  : 'Live location not shared yet'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="emergency-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            <h1>Emergency Dashboard</h1>
            <p>{viewerLabel}</p>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search travelers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
            <button className="search-btn">Search</button>
          </div>
        </div>

        <div className="header-right">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>System Online</span>
          </div>
          <div className="notification-bell" onClick={() => setNotifications(0)}>
            Alerts
            {notifications > 0 && <span className="notification-count">{notifications}</span>}
          </div>
          <div className="current-time">{currentTime.toLocaleTimeString()}</div>
          <div className="admin-profile">
            <div className="profile-avatar">P</div>
            <span>{viewerLabel}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`nav-tab ${activeTab === 'tourists' ? 'active' : ''}`} onClick={() => setActiveTab('tourists')}>Registered Travelers</button>
      </div>

      <div className="dashboard-main">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tourists' && renderTravelers()}
      </div>
    </div>
  );
};

export default EmergencyDashboard;
