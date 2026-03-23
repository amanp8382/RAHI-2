import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllTravelerRecords } from '../utils/travelerLedger';
import EmergencyDashboard from './EmergencyDashboard';
import '../styles/auth.css';

const PoliceDashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('travelers');
  const [searchTerm, setSearchTerm] = useState('');

  const travelerRecords = useMemo(() => getAllTravelerRecords(), [user]);

  const filteredTravelers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return travelerRecords;

    return travelerRecords.filter((record) => (
      record.fullName?.toLowerCase().includes(query) ||
      record.email?.toLowerCase().includes(query) ||
      record.phone?.includes(query) ||
      record.travelerId?.toLowerCase().includes(query) ||
      record.destination?.toLowerCase().includes(query)
    ));
  }, [searchTerm, travelerRecords]);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && user?.userType !== 'police') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="auth-page admin-shell-page">
      <div className="admin-portal">
        <div className="admin-portal-header">
          <div>
            <p className="auth-eyebrow">RAAHI Police</p>
            <h1>{user?.stationName || 'Police Dashboard'}</h1>
            <p>Police access with registered traveler information and the emergency dashboard.</p>
          </div>
          <button type="button" className="auth-submit secondary" onClick={handleLogout}>Logout</button>
        </div>

        <div className="admin-tabs">
          <button type="button" className={`admin-tab ${activeTab === 'travelers' ? 'active' : ''}`} onClick={() => setActiveTab('travelers')}>Registered Travelers</button>
          <button type="button" className={`admin-tab ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>Emergency Dashboard</button>
        </div>

        {activeTab === 'travelers' && (
          <div className="admin-panel">
            <div className="admin-panel-toolbar">
              <div>
                <h2>Traveler Information</h2>
                <p>{travelerRecords.length} registered traveler records available for police review.</p>
              </div>
              <input
                className="admin-search-input"
                type="text"
                placeholder="Search by name, traveler ID, email, phone, destination..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="admin-user-grid">
              {filteredTravelers.map((record) => (
                <div key={record.travelerId} className="admin-user-card">
                  <div className="traveler-pass-header">
                    <img
                      src={record.profilePhoto?.dataUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.fullName || 'Traveler')}&background=0f766e&color=fff&size=128`}
                      alt={record.fullName}
                    />
                    <div>
                      <h3>{record.fullName || 'Unnamed traveler'}</h3>
                      <p>{record.email || 'No email added'}</p>
                      <span className={`profile-status-badge ${record.aadhaarVerified ? 'verified' : 'pending'}`}>
                        {record.aadhaarVerified ? 'Aadhaar format verified' : 'Aadhaar pending'}
                      </span>
                    </div>
                  </div>

                  <div className="traveler-pass-grid">
                    <div>
                      <strong>Traveler ID</strong>
                      <span>{record.travelerId}</span>
                    </div>
                    <div>
                      <strong>Phone</strong>
                      <span>{record.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <strong>Age</strong>
                      <span>{record.age || 'Not provided'}</span>
                    </div>
                    <div>
                      <strong>Destination</strong>
                      <span>{record.destination || 'Not provided'}</span>
                    </div>
                    <div>
                      <strong>Trip Duration</strong>
                      <span>{record.tripDurationDays ? `${record.tripDurationDays} days` : 'Not provided'}</span>
                    </div>
                    <div>
                      <strong>Blood Group</strong>
                      <span>{record.bloodGroup || 'Not provided'}</span>
                    </div>
                    <div>
                      <strong>Health Details</strong>
                      <span>{record.medicalConditions || 'None shared'}</span>
                    </div>
                    <div>
                      <strong>Aadhaar</strong>
                      <span>{record.aadhaarMasked || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="traveler-pass-preferences">
                    <strong>Travel Preferences</strong>
                    <div className="preference-grid">
                      {record.travelPreferences?.length > 0 ? record.travelPreferences.map((item) => (
                        <div key={item} className="preference-chip selected">
                          <span>{item}</span>
                        </div>
                      )) : <span>No preferences shared</span>}
                    </div>
                  </div>

                  <div className="admin-user-footer">
                    <span>Updated: {new Date(record.updatedAt || record.issuedAt).toLocaleString()}</span>
                    <a className="auth-link-button" href={record.publicCardPath} target="_blank" rel="noreferrer">Open public card</a>
                  </div>
                </div>
              ))}
            </div>

            {filteredTravelers.length === 0 && (
              <div className="auth-alert auth-alert-error">
                <p>No traveler records found for this search.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="admin-panel admin-emergency-panel">
            <EmergencyDashboard travelerRecords={travelerRecords} viewerLabel={user?.stationName || 'Police Unit'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;
