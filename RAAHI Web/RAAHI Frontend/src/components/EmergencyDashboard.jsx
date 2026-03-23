import React, { useState, useEffect } from 'react';
import './EmergencyDashboard.css';

const EmergencyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Tourist Management States
  const [touristSearch, setTouristSearch] = useState('');
  const [selectedTourist, setSelectedTourist] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [showLocationMap, setShowLocationMap] = useState(false);

  // Mock data
  const [dashboardData] = useState({
    stats: {
      totalTourists: 2847,
      activeAlerts: 12,
      missingPersons: 3,
      iotDevicesOnline: 1247,
      responseTeams: 8,
      safeZones: 15
    },
    tourists: [
      {
        id: 'T001',
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        nationality: 'USA',
        checkinDate: '2024-01-15',
        currentLocation: {
          lat: 28.6129,
          lng: 77.2295,
          address: 'Red Fort, Delhi',
          lastUpdate: new Date(Date.now() - 300000),
          accuracy: 'High'
        },
        status: 'active',
        riskLevel: 'low',
        emergencyContact: '+1-555-9876',
        itinerary: ['Red Fort', 'India Gate', 'Lotus Temple'],
        deviceId: 'DEV001'
      },
      {
        id: 'T002',
        name: 'Sarah Smith',
        email: 'sarah.smith@email.com',
        phone: '+44-20-7946-0958',
        nationality: 'UK',
        checkinDate: '2024-01-14',
        currentLocation: {
          lat: 28.5535,
          lng: 77.2588,
          address: 'Chandni Chowk Market',
          lastUpdate: new Date(Date.now() - 600000),
          accuracy: 'Medium'
        },
        status: 'active',
        riskLevel: 'medium',
        emergencyContact: '+44-20-7946-1234',
        itinerary: ['Chandni Chowk', 'Jama Masjid', 'Humayun Tomb'],
        deviceId: 'DEV002'
      },
      {
        id: 'T003',
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        phone: '+61-2-9876-5432',
        nationality: 'Australia',
        checkinDate: '2024-01-16',
        currentLocation: {
          lat: 28.5562,
          lng: 77.1000,
          address: 'India Gate Lawns',
          lastUpdate: new Date(Date.now() - 180000),
          accuracy: 'High'
        },
        status: 'active',
        riskLevel: 'low',
        emergencyContact: '+61-2-9876-1111',
        itinerary: ['India Gate', 'Rashtrapati Bhavan', 'National Museum'],
        deviceId: 'DEV003'
      },
      {
        id: 'T004',
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        phone: '+33-1-23-45-67-89',
        nationality: 'France',
        checkinDate: '2024-01-13',
        currentLocation: {
          lat: 28.5245,
          lng: 77.1855,
          address: 'Karol Bagh Market',
          lastUpdate: new Date(Date.now() - 1200000),
          accuracy: 'Low'
        },
        status: 'missing',
        riskLevel: 'high',
        emergencyContact: '+33-1-98-76-54-32',
        itinerary: ['Karol Bagh', 'Connaught Place', 'Khan Market'],
        deviceId: 'DEV004'
      },
      {
        id: 'T005',
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+34-91-123-4567',
        nationality: 'Spain',
        checkinDate: '2024-01-15',
        currentLocation: {
          lat: 28.6139,
          lng: 77.2090,
          address: 'Lotus Temple Gardens',
          lastUpdate: new Date(Date.now() - 450000),
          accuracy: 'High'
        },
        status: 'active',
        riskLevel: 'low',
        emergencyContact: '+34-91-987-6543',
        itinerary: ['Lotus Temple', 'Akshardham', 'Humayun Tomb'],
        deviceId: 'DEV005'
      }
    ],
    alerts: [
      {
        id: 'ALT001',
        type: 'SOS',
        severity: 'high',
        location: 'Red Fort, Delhi',
        time: new Date(Date.now() - 300000),
        tourist: 'John Doe',
        status: 'active'
      },
      {
        id: 'ALT002',
        type: 'Geo-fence Breach',
        severity: 'medium',
        location: 'Chandni Chowk',
        time: new Date(Date.now() - 600000),
        tourist: 'Sarah Smith',
        status: 'investigating'
      },
      {
        id: 'ALT003',
        type: 'Medical Emergency',
        severity: 'high',
        location: 'India Gate',
        time: new Date(Date.now() - 900000),
        tourist: 'Mike Johnson',
        status: 'resolved'
      },
      {
        id: 'ALT004',
        type: 'Lost Tourist',
        severity: 'medium',
        location: 'Karol Bagh',
        time: new Date(Date.now() - 1200000),
        tourist: 'Emma Wilson',
        status: 'active'
      }
    ],
    incidents: [
      {
        id: 'INC001',
        type: 'Panic Button',
        severity: 'critical',
        location: 'Connaught Place',
        time: new Date(Date.now() - 180000),
        description: 'Tourist activated panic button',
        status: 'responding',
        responders: 2
      },
      {
        id: 'INC002',
        type: 'Crowd Alert',
        severity: 'medium',
        location: 'Lotus Temple',
        time: new Date(Date.now() - 450000),
        description: 'High crowd density detected',
        status: 'monitoring',
        responders: 1
      }
    ]
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#16a34a'
    };
    return colors[severity] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#dc2626',
      responding: '#ea580c',
      investigating: '#d97706',
      monitoring: '#2563eb',
      resolved: '#16a34a'
    };
    return colors[status] || '#6b7280';
  };

  const getTouristStatusColor = (status) => {
    const colors = {
      active: '#22c55e',
      missing: '#ef4444',
      offline: '#6b7280',
      emergency: '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      low: '#22c55e',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };
    return colors[level] || '#6b7280';
  };

  const getAccuracyColor = (accuracy) => {
    const colors = {
      High: '#22c55e',
      Medium: '#f59e0b',
      Low: '#ef4444'
    };
    return colors[accuracy] || '#6b7280';
  };

  const searchTourists = () => {
    if (!touristSearch.trim()) return dashboardData.tourists;
    
    return dashboardData.tourists.filter(tourist => 
      tourist.email.toLowerCase().includes(touristSearch.toLowerCase()) ||
      tourist.name.toLowerCase().includes(touristSearch.toLowerCase()) ||
      tourist.phone.includes(touristSearch) ||
      tourist.id.toLowerCase().includes(touristSearch.toLowerCase())
    );
  };

  const getFilteredTourists = () => {
    let filtered = searchTourists();
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tourist => tourist.status === filterStatus);
    }
    
    if (filterRisk !== 'all') {
      filtered = filtered.filter(tourist => tourist.riskLevel === filterRisk);
    }
    
    return filtered;
  };

  const handleTouristSelect = (tourist) => {
    setSelectedTourist(tourist);
    setShowLocationMap(true);
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        <div className="stat-info">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </div>
      {trend && (
        <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  const AlertCard = ({ alert }) => (
    <div className={`alert-card severity-${alert.severity}`}>
      <div className="alert-header">
        <div className="alert-type">{alert.type}</div>
        <div className="alert-time">{formatTime(alert.time)}</div>
      </div>
      <div className="alert-location">📍 {alert.location}</div>
      <div className="alert-tourist">👤 {alert.tourist}</div>
      <div className="alert-footer">
        <div className={`alert-status status-${alert.status}`}>
          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
        </div>
        <div className="alert-actions">
          <button className="btn-action btn-view">View</button>
          <button className="btn-action btn-respond">Respond</button>
        </div>
      </div>
    </div>
  );

  const IncidentCard = ({ incident }) => (
    <div className={`incident-card severity-${incident.severity}`}>
      <div className="incident-header">
        <div className="incident-id">{incident.id}</div>
        <div className={`incident-severity ${incident.severity}`}>
          {incident.severity.toUpperCase()}
        </div>
      </div>
      <div className="incident-type">{incident.type}</div>
      <div className="incident-description">{incident.description}</div>
      <div className="incident-details">
        <div className="incident-location">📍 {incident.location}</div>
        <div className="incident-time">🕒 {formatTime(incident.time)}</div>
        <div className="incident-responders">👮 {incident.responders} responders</div>
      </div>
      <div className="incident-footer">
        <div className={`incident-status status-${incident.status}`}>
          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
        </div>
        <div className="incident-actions">
          <button className="btn-action btn-escalate">Escalate</button>
          <button className="btn-action btn-resolve">Resolve</button>
        </div>
      </div>
    </div>
  );

  const TouristCard = ({ tourist }) => (
    <div className={`tourist-card ${tourist.status}`} onClick={() => handleTouristSelect(tourist)}>
      <div className="tourist-header">
        <div className="tourist-info">
          <div className="tourist-id">{tourist.id}</div>
          <div className="tourist-name">{tourist.name}</div>
          <div className="tourist-email">{tourist.email}</div>
        </div>
        <div className="tourist-status-badges">
          <div className={`status-badge ${tourist.status}`}>
            {tourist.status.charAt(0).toUpperCase() + tourist.status.slice(1)}
          </div>
          <div className={`risk-badge ${tourist.riskLevel}`}>
            {tourist.riskLevel.charAt(0).toUpperCase() + tourist.riskLevel.slice(1)} Risk
          </div>
        </div>
      </div>
      <div className="tourist-details">
        <div className="detail-item">
          <span className="detail-icon">📱</span>
          <span>{tourist.phone}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">🌍</span>
          <span>{tourist.nationality}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span>Check-in: {tourist.checkinDate}</span>
        </div>
      </div>
      <div className="location-info">
        <div className="location-header">
          <span className="location-icon">📍</span>
          <span className="location-title">Current Location</span>
          <div className={`accuracy-badge ${tourist.currentLocation.accuracy.toLowerCase()}`}>
            {tourist.currentLocation.accuracy}
          </div>
        </div>
        <div className="location-address">{tourist.currentLocation.address}</div>
        <div className="location-coords">
          {tourist.currentLocation.lat.toFixed(4)}, {tourist.currentLocation.lng.toFixed(4)}
        </div>
        <div className="location-update">
          Last updated: {formatTime(tourist.currentLocation.lastUpdate)}
        </div>
      </div>
      <div className="tourist-actions">
        <button className="btn-action btn-locate">View Map</button>
        <button className="btn-action btn-contact">Contact</button>
        <button className="btn-action btn-track">Track</button>
      </div>
    </div>
  );

  const LocationMapModal = ({ tourist, onClose }) => (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📍 {tourist.name}'s Location</h3>
          <button className="close-modal" onClick={onClose}>✕</button>
        </div>
        <div className="modal-content">
          <div className="location-details">
            <div className="location-summary">
              <div className="summary-item">
                <strong>Address:</strong> {tourist.currentLocation.address}
              </div>
              <div className="summary-item">
                <strong>Coordinates:</strong> {tourist.currentLocation.lat.toFixed(6)}, {tourist.currentLocation.lng.toFixed(6)}
              </div>
              <div className="summary-item">
                <strong>Last Update:</strong> {formatTime(tourist.currentLocation.lastUpdate)}
              </div>
              <div className="summary-item">
                <strong>Accuracy:</strong> 
                <span className={`accuracy-indicator ${tourist.currentLocation.accuracy.toLowerCase()}`}>
                  {tourist.currentLocation.accuracy}
                </span>
              </div>
            </div>
          </div>
          <div className="map-placeholder">
            <div className="map-content">
              <div className="map-icon">🗺️</div>
              <p>Interactive Map View</p>
              <p className="map-coords">
                Lat: {tourist.currentLocation.lat.toFixed(6)}<br/>
                Lng: {tourist.currentLocation.lng.toFixed(6)}
              </p>
              <div className="location-marker">📍</div>
            </div>
          </div>
          <div className="tourist-itinerary">
            <h4>🗓️ Planned Itinerary</h4>
            <div className="itinerary-list">
              {tourist.itinerary.map((place, index) => (
                <div key={index} className="itinerary-item">
                  <span className="itinerary-number">{index + 1}</span>
                  <span className="itinerary-place">{place}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTouristManagement = () => {
    const filteredTourists = getFilteredTourists();
    
    return (
      <div className="tourist-management">
        {/* Search and Filter Section */}
        <div className="management-controls">
          <div className="search-section">
            <div className="search-container-advanced">
              <input
                type="text"
                placeholder="Search by email, name, phone, or ID..."
                value={touristSearch}
                onChange={(e) => setTouristSearch(e.target.value)}
                className="tourist-search-input"
              />
              <button className="search-btn-advanced">🔍</button>
            </div>
          </div>
          
          <div className="filter-section">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="missing">Missing</option>
              <option value="offline">Offline</option>
              <option value="emergency">Emergency</option>
            </select>
            
            <select 
              value={filterRisk} 
              onChange={(e) => setFilterRisk(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="search-summary">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-number">{filteredTourists.length}</span>
              <span className="summary-label">Tourists Found</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{filteredTourists.filter(t => t.status === 'active').length}</span>
              <span className="summary-label">Active</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{filteredTourists.filter(t => t.status === 'missing').length}</span>
              <span className="summary-label">Missing</span>
            </div>
            <div className="summary-item">
              <span className="summary-number">{filteredTourists.filter(t => t.riskLevel === 'high').length}</span>
              <span className="summary-label">High Risk</span>
            </div>
          </div>
        </div>

        {/* Tourist Cards Grid */}
        <div className="tourists-grid">
          {filteredTourists.map(tourist => (
            <TouristCard key={tourist.id} tourist={tourist} />
          ))}
        </div>

        {/* Location Map Modal */}
        {showLocationMap && selectedTourist && (
          <LocationMapModal 
            tourist={selectedTourist} 
            onClose={() => {
              setShowLocationMap(false);
              setSelectedTourist(null);
            }}
          />
        )}

        {/* No Results */}
        {filteredTourists.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No tourists found</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="dashboard-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Tourists" 
          value={dashboardData.stats.totalTourists.toLocaleString()} 
          icon="👥" 
          color="blue"
          trend={5.2}
          subtitle="Currently registered"
        />
        <StatCard 
          title="Active Alerts" 
          value={dashboardData.stats.activeAlerts} 
          icon="🚨" 
          color="red"
          trend={-12.3}
          subtitle="Requires attention"
        />
        <StatCard 
          title="Missing Persons" 
          value={dashboardData.stats.missingPersons} 
          icon="⚠️" 
          color="orange"
          trend={0}
          subtitle="Search ongoing"
        />
        <StatCard 
          title="IoT Devices" 
          value={dashboardData.stats.iotDevicesOnline.toLocaleString()} 
          icon="📡" 
          color="green"
          trend={2.1}
          subtitle="Online & monitoring"
        />
        <StatCard 
          title="Response Teams" 
          value={dashboardData.stats.responseTeams} 
          icon="🚑" 
          color="purple"
          trend={0}
          subtitle="Deployed teams"
        />
        <StatCard 
          title="Safe Zones" 
          value={dashboardData.stats.safeZones} 
          icon="🛡️" 
          color="green"
          trend={6.7}
          subtitle="Verified locations"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Heat Map */}
        <div className="dashboard-card heatmap-card">
          <div className="card-header">
            <h3>Live Heat Map</h3>
            <p>Real-time tourist distribution and risk zones</p>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-display">
              <svg viewBox="0 0 600 350" className="heatmap-svg">
                {/* Background zones */}
                <circle cx="150" cy="100" r="60" fill="rgba(34, 197, 94, 0.2)" className="zone safe-zone" />
                <circle cx="300" cy="80" r="45" fill="rgba(34, 197, 94, 0.2)" className="zone safe-zone" />
                <circle cx="450" cy="120" r="55" fill="rgba(34, 197, 94, 0.2)" className="zone safe-zone" />
                
                <circle cx="200" cy="200" r="40" fill="rgba(245, 158, 11, 0.3)" className="zone medium-zone" />
                <circle cx="400" cy="250" r="35" fill="rgba(245, 158, 11, 0.3)" className="zone medium-zone" />
                
                <rect x="280" y="280" width="100" height="50" rx="8" fill="rgba(239, 68, 68, 0.3)" className="zone danger-zone" />
                
                {/* Tourist points */}
                <circle cx="160" cy="110" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="290" cy="90" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="440" cy="130" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="210" cy="210" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="320" cy="300" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="390" cy="260" r="3" fill="#ef4444" className="tourist-dot">
                  <animate attributeName="r" values="3;5;3" dur="2.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div className="heatmap-legend">
              <div className="legend-item">
                <div className="legend-dot safe"></div>
                <span>Safe Zones</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot medium"></div>
                <span>Moderate Risk</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot danger"></div>
                <span>High Risk</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot tourist"></div>
                <span>Tourists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="dashboard-card alerts-card">
          <div className="card-header">
            <h3>Live Alerts</h3>
            <p>Real-time emergency notifications</p>
          </div>
          <div className="alerts-container">
            {dashboardData.alerts.slice(0, 4).map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="dashboard-card incidents-table-card">
        <div className="card-header">
          <h3>Recent Incidents</h3>
          <p>Latest emergency incidents and their status</p>
        </div>
        <div className="incidents-grid">
          {dashboardData.incidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="emergency-dashboard">
      {/* Top Navigation Bar */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="header-title">
            <h1>👤 Admin Dashboard</h1>
            <p>Smart Tourism Management System</p>
          </div>
        </div>
        
        <div className="header-center">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search alerts, incidents, or tourists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>

        <div className="header-right">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>System Online</span>
          </div>
          <div className="notification-bell" onClick={() => setNotifications(0)}>
            🔔
            {notifications > 0 && (
              <span className="notification-count">{notifications}</span>
            )}
          </div>
          <div className="current-time">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="admin-profile">
            <div className="profile-avatar">👤</div>
            <span>System Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="nav-icon">📊</span>
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <span className="nav-icon">🚨</span>
          Active Incidents
        </button>
        <button 
          className={`nav-tab ${activeTab === 'tourists' ? 'active' : ''}`}
          onClick={() => setActiveTab('tourists')}
        >
          <span className="nav-icon">👥</span>
          Tourist Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="nav-icon">📈</span>
          Analytics
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'incidents' && <div className="tab-content">Incidents Management Coming Soon...</div>}
        {activeTab === 'tourists' && renderTouristManagement()}
        {activeTab === 'analytics' && <div className="tab-content">Analytics Coming Soon...</div>}
      </div>
    </div>
  );
};

export default EmergencyDashboard;