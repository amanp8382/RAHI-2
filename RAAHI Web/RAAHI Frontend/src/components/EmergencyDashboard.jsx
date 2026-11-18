import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { getAllTravelerRecords, refreshTravelerRecords } from '../utils/travelerLedger';
import { getAllTravelerLiveLocations, updateLiveLocationCache } from '../utils/liveLocationStore';
import './EmergencyDashboard.css';

const PoliceIndiaMap = lazy(() => import('./PoliceIndiaMap'));
import { hasValidCoordinates, isRecentLocation } from '../utils/locationValidation';

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

  const [liveLocations, setLiveLocations] = useState(getAllTravelerLiveLocations);
  const [serverRecords, setServerRecords] = useState(getAllTravelerRecords);
  const [dataError, setDataError] = useState('');
  useEffect(() => {
    if (travelerRecords !== null) return undefined;
    let active = true;
    const refresh = async () => {
      try {
        const records = await refreshTravelerRecords();
        if (active) { setServerRecords(records); setLiveLocations(updateLiveLocationCache(records)); setDataError(''); }
      } catch { if (active) setDataError('Sign in with an authorized police or department account to load MongoDB traveler data.'); }
    };
    void refresh(); const timer = setInterval(refresh, 10000);
    return () => { active = false; clearInterval(timer); };
  }, [travelerRecords]);

  useEffect(() => {
    const refresh = () => setLiveLocations(getAllTravelerLiveLocations());
    const timer = setInterval(refresh, 5000);
    window.addEventListener('storage', refresh);
    window.addEventListener('raahi-location-update', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('raahi-location-update', refresh);
    };
  }, []);

  useEffect(() => {
    if (travelerRecords) setLiveLocations(updateLiveLocationCache(travelerRecords));
  }, [travelerRecords]);

  const liveTravelers = useMemo(() => {
    const source = travelerRecords ?? serverRecords;
    return source.map((record) => {
      const liveLocation = liveLocations[record.travelerId];
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
          lat: liveLocation?.lat ?? null,
          lng: liveLocation?.lng ?? null,
          accuracy: liveLocation?.accuracy ?? null,
          updatedAt: liveLocation?.updatedAt || null
        }
      };
    });
  }, [travelerRecords, serverRecords, liveLocations]);

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
    recentLocations: liveTravelers.filter(t => isRecentLocation(t.currentLocation, currentTime.getTime())).length,
    missingLocations: liveTravelers.filter(t => !hasValidCoordinates(t.currentLocation)).length
  }), [liveTravelers, currentTime]);

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
    if (!value) return 'Not shared';
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
              <div className="stat-value">{stats.recentLocations}</div>
              <div className="stat-title">Recent GPS Updates</div>
              <div className="stat-subtitle">Reported within 2 minutes</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon red">Red</div>
            <div className="stat-info">
              <div className="stat-value">{stats.missingLocations}</div>
              <div className="stat-title">No GPS Shared</div>
              <div className="stat-subtitle">Awaiting location permission</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card heatmap-card">
          <div className="card-header">
            <h3>Police Zone Map</h3>
            <p>India overview with real reported GPS locations. Zoom in or select a traveler to inspect their position.</p>
          </div>
          <Suspense fallback={<p className="police-map-note">Loading India map?</p>}>
            <PoliceIndiaMap travelers={filteredTravelers} now={currentTime.getTime()} />
          </Suspense>
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
                {hasValidCoordinates(traveler.currentLocation)
                  ? `Reported GPS: ${traveler.currentLocation.lat.toFixed(5)}, ${traveler.currentLocation.lng.toFixed(5)}`
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

      {dataError && <p role="alert" className="auth-alert auth-alert-error">{dataError}</p>}
      <div className="dashboard-main">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tourists' && renderTravelers()}
      </div>
    </div>
  );
};

export default EmergencyDashboard;
