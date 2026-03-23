import React, { useState, useEffect, useRef } from 'react';

const AdminDashboard = () => {
  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState(3);
  
  // Data states
  const [tourists, setTourists] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalTourists: 1247,
    activeAlerts: 5,
    missingPersons: 1,
    iotDevicesOnline: 892
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedTourist, setSelectedTourist] = useState(null);
  const mapRef = useRef(null);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock tourists
    setTourists([
      {
        id: 'T001',
        name: 'John Doe',
        email: 'john@example.com',
        location: 'Red Fort, Delhi',
        status: 'active',
        lastSeen: new Date(),
        digitalId: 'DID-001',
        verified: true
      },
      {
        id: 'T002',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        location: 'India Gate, Delhi',
        status: 'alert',
        lastSeen: new Date(Date.now() - 30000),
        digitalId: 'DID-002',
        verified: true
      }
    ]);

    // Mock incidents
    setIncidents([
      {
        id: 'INC001',
        type: 'SOS Alert',
        severity: 'high',
        time: new Date(),
        location: 'Connaught Place, Delhi',
        status: 'pending',
        touristId: 'T001',
        touristName: 'John Doe'
      },
      {
        id: 'INC002',
        type: 'Geo-fence Breach',
        severity: 'medium',
        time: new Date(Date.now() - 600000),
        location: 'Old Delhi Market',
        status: 'resolved',
        touristId: 'T002',
        touristName: 'Sarah Smith'
      }
    ]);

    // Mock alerts
    setAlerts([
      {
        id: 'ALT001',
        message: 'Tourist T001 triggered SOS alert',
        type: 'sos',
        time: new Date(),
        severity: 'high'
      },
      {
        id: 'ALT002',
        message: 'Unusual crowd density detected at India Gate',
        type: 'anomaly',
        time: new Date(Date.now() - 300000),
        severity: 'medium'
      }
    ]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleIncidentAction = (incidentId, action) => {
    console.log(`Action ${action} triggered for incident ${incidentId}`);
    // Update incident status
    setIncidents(prev => 
      prev.map(inc => 
        inc.id === incidentId 
          ? { ...inc, status: action === 'resolve' ? 'resolved' : 'in-progress' }
          : inc
      )
    );
  };

  const renderTopBar = () => (
    <div className="admin-topbar">
      <div className="topbar-left">
        <h1 className="dashboard-title">🚨 Emergency Dashboard</h1>
      </div>
      <div className="topbar-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by Tourist ID or Incident ID..."
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

  const renderSidebar = () => (
    <div className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>RAAHI Admin</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button 
          className={`nav-item ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <span className="nav-icon">🚨</span>
          Incidents
        </button>
        <button 
          className={`nav-item ${activeTab === 'tourists' ? 'active' : ''}`}
          onClick={() => setActiveTab('tourists')}
        >
          <span className="nav-icon">👥</span>
          Tourists
        </button>
      </nav>
    </div>
  );

  const renderStatsCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon blue">👥</div>
        <div className="stat-content">
          <h3>{stats.totalTourists}</h3>
          <p>Total Tourists</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon red">🚨</div>
        <div className="stat-content">
          <h3>{stats.activeAlerts}</h3>
          <p>Active Alerts</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon orange">⚠️</div>
        <div className="stat-content">
          <h3>{stats.missingPersons}</h3>
          <p>Missing Persons</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon green">📡</div>
        <div className="stat-content">
          <h3>{stats.iotDevicesOnline}</h3>
          <p>IoT Devices Online</p>
        </div>
      </div>
    </div>
  );

  const renderHeatmapPanel = () => (
    <div className="heatmap-panel">
      <h3>Interactive Heat Map</h3>
      <p className="heatmap-subtitle">Tourist clusters, restricted areas, and live alerts</p>
      <div className="heatmap-container">
        <div className="heatmap-content">
          {/* Mock heatmap visualization */}
          <svg className="heatmap-svg" viewBox="0 0 500 300">
            {/* Background areas */}
            <circle cx="100" cy="80" r="40" fill="rgba(34, 197, 94, 0.3)" className="safe-zone" />
            <circle cx="200" cy="120" r="30" fill="rgba(34, 197, 94, 0.3)" className="safe-zone" />
            <circle cx="300" cy="60" r="35" fill="rgba(34, 197, 94, 0.3)" className="safe-zone" />
            <circle cx="400" cy="100" r="45" fill="rgba(34, 197, 94, 0.3)" className="safe-zone" />
            
            <circle cx="150" cy="180" r="25" fill="rgba(245, 158, 11, 0.3)" className="moderate-zone" />
            <circle cx="350" cy="200" r="30" fill="rgba(245, 158, 11, 0.3)" className="moderate-zone" />
            
            <rect x="180" y="190" width="80" height="60" rx="8" fill="rgba(239, 68, 68, 0.3)" className="danger-zone" />
            
            {/* Tourist markers */}
            <circle cx="120" cy="90" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="180" cy="140" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="280" cy="80" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="320" cy="180" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="400" cy="120" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="220" cy="220" r="4" fill="#ef4444" className="tourist-marker" />
            <circle cx="380" cy="250" r="4" fill="#ef4444" className="tourist-marker" />
          </svg>
          
          <div className="heatmap-legend">
            <div className="legend-item">
              <span className="legend-dot safe"></span>
              Safe
            </div>
            <div className="legend-item">
              <span className="legend-dot moderate"></span>
              Moderate
            </div>
            <div className="legend-item">
              <span className="legend-dot danger"></span>
              High
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLiveAlertsFeed = () => (
    <div className="alerts-feed">
      <h3>Live Alert Feed</h3>
      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.severity}`}>
            <div className="alert-time">
              {alert.time.toLocaleTimeString()}
            </div>
            <div className="alert-message">
              {alert.message}
            </div>
            <div className={`alert-badge ${alert.severity}`}>
              {alert.severity.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIncidentsTable = () => (
    <div className="incidents-table-container">
      <h3>Recent Incidents</h3>
      <div className="table-wrapper">
        <table className="incidents-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(incident => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>
                  <span className={`incident-type ${incident.severity}`}>
                    {incident.type}
                  </span>
                </td>
                <td>{incident.time.toLocaleTimeString()}</td>
                <td>{incident.location}</td>
                <td>
                  <span className={`status-badge ${incident.status}`}>
                    {incident.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-btn view"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="dashboard-view">
      {renderStatsCards()}
      <div className="dashboard-grid">
        <div className="dashboard-left">
          {renderHeatmapPanel()}
          {renderIncidentsTable()}
        </div>
        <div className="dashboard-right">
          {renderLiveAlertsFeed()}
        </div>
      </div>
    </div>
  );

  const renderIncidentsView = () => (
    <div className="incidents-view">
      <div className="view-header">
        <h2>Incident Management</h2>
        <div className="incident-filters">
          <select className="filter-select">
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      
      <div className="incidents-grid">
        {incidents.map(incident => (
          <div key={incident.id} className="incident-card">
            <div className="incident-header">
              <span className={`severity-tag ${incident.severity}`}>
                {incident.severity.toUpperCase()}
              </span>
              <span className="incident-id">{incident.id}</span>
            </div>
            <h4>{incident.type}</h4>
            <p><strong>Tourist:</strong> {incident.touristName}</p>
            <p><strong>Location:</strong> {incident.location}</p>
            <p><strong>Time:</strong> {incident.time.toLocaleString()}</p>
            
            <div className="incident-timeline">
              <div className={`timeline-step ${incident.status !== 'pending' ? 'completed' : ''}`}>
                Detected
              </div>
              <div className={`timeline-step ${incident.status === 'resolved' ? 'completed' : ''}`}>
                Escalated
              </div>
              <div className={`timeline-step ${incident.status === 'resolved' ? 'completed' : ''}`}>
                Resolved
              </div>
            </div>
            
            <div className="incident-actions">
              <button 
                className="action-btn police"
                onClick={() => handleIncidentAction(incident.id, 'notify-police')}
              >
                🚔 Notify Police
              </button>
              <button 
                className="action-btn ambulance"
                onClick={() => handleIncidentAction(incident.id, 'notify-ambulance')}
              >
                🚑 Notify Ambulance
              </button>
              <button 
                className="action-btn resolve"
                onClick={() => handleIncidentAction(incident.id, 'resolve')}
              >
                ✅ Mark Resolved
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTouristsView = () => (
    <div className="tourists-view">
      <div className="view-header">
        <h2>Tourist Management</h2>
        <div className="tourist-filters">
          <input 
            type="text" 
            placeholder="Search tourists..." 
            className="search-input"
          />
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="alert">Alert</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      
      <div className="tourists-grid">
        {tourists.map(tourist => (
          <div key={tourist.id} className="tourist-card">
            <div className="tourist-header">
              <img 
                src={`https://ui-avatars.com/api/?name=${tourist.name}&background=007bff&color=fff`} 
                alt={tourist.name}
                className="tourist-avatar"
              />
              <div className="tourist-info">
                <h4>{tourist.name}</h4>
                <p>{tourist.email}</p>
                <span className={`status-badge ${tourist.status}`}>
                  {tourist.status}
                </span>
              </div>
            </div>
            
            <div className="tourist-details">
              <p><strong>ID:</strong> {tourist.id}</p>
              <p><strong>Digital ID:</strong> {tourist.digitalId}</p>
              <p><strong>Location:</strong> {tourist.location}</p>
              <p><strong>Last Seen:</strong> {tourist.lastSeen.toLocaleString()}</p>
              
              {tourist.verified && (
                <div className="verification-badge">
                  🔐 Blockchain Verified
                </div>
              )}
            </div>
            
            <div className="tourist-actions">
              <button 
                className="action-btn view"
                onClick={() => setSelectedTourist(tourist)}
              >
                👤 View Profile
              </button>
              <button className="action-btn track">
                📍 Track Movement
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="watchlist-panel">
        <h3>🔍 Watchlist</h3>
        <div className="watchlist-item">
          <span>No flagged users</span>
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardView();
      case 'incidents':
        return renderIncidentsView();
      case 'tourists':
        return renderTouristsView();
      default:
        return renderDashboardView();
    }
  };

  return (
    <div className="admin-dashboard-container">
      {renderTopBar()}
      <div className="dashboard-body">
        {renderSidebar()}
        <main className="main-content">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;