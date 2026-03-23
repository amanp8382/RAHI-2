import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTravelerQrUrl } from '../utils/travelerLedger';
import { saveTravelerLiveLocation } from '../utils/liveLocationStore';
import '../styles/auth.css';

const hasCompletedProfile = (user) => (
  Boolean(
    user?.phone &&
    user?.age &&
    user?.destination &&
    user?.tripDurationDays &&
    user?.bloodGroup &&
    user?.aadhaarVerified
  )
);

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [locationStatus, setLocationStatus] = useState('Requesting live location...');

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && isAuthenticated && !hasCompletedProfile(user)) {
    return <Navigate to="/profile-setup" replace />;
  }

  if (!user) {
    return null;
  }

  const displayName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Traveler';
  const profileImage = user.profilePhoto?.dataUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f766e&color=fff&size=160`;
  const publicCardUrl = user.publicCardPath ? `${window.location.origin}${user.publicCardPath}` : '';
  const qrCodeUrl = publicCardUrl ? getTravelerQrUrl(publicCardUrl) : '';
  const aadhaarDisplay = user.aadhaarNumber ? `XXXX-XXXX-${String(user.aadhaarNumber).slice(-4)}` : 'Not provided';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user?.travelerId || user?.userType !== 'tourist') {
      return undefined;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Live location is not supported in this browser.');
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        saveTravelerLiveLocation(user.travelerId, {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: user.destination || 'Current traveler location'
        });
        setLocationStatus(`Live location active (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
      },
      () => {
        setLocationStatus('Location permission denied or unavailable.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user?.travelerId, user?.userType, user?.destination]);

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-copy">
          <p className="auth-eyebrow">RAAHI Profile</p>
          <h1>{displayName}</h1>
          <p className="auth-subtitle">Your traveler information is saved. You can edit your profile, open the public verification card, and continue using the rest of the website as a logged-in user.</p>
          <div className="auth-tip-list">
            <div>Traveler ID: {user.travelerId || 'Pending'}</div>
            <div>Aadhaar: {user.aadhaarVerified ? 'Format verified' : 'Not verified'}</div>
            <div>Destination: {user.destination || 'Not provided'}</div>
            <div>{locationStatus}</div>
          </div>
        </div>

        <div className="auth-form">
          <div className="profile-shell">
            <div className="profile-summary-card">
              <div className="traveler-pass-header">
                <img src={profileImage} alt={displayName} />
                <div>
                  <h2>{displayName}</h2>
                  <p>{user.email || 'No email added'}</p>
                  <span className={`profile-status-badge ${user.aadhaarVerified ? 'verified' : 'pending'}`}>
                    {user.aadhaarVerified ? 'Verified traveler' : 'Profile incomplete'}
                  </span>
                </div>
              </div>

              <div className="profile-quick-grid">
                <div className="profile-quick-item">
                  <strong>Destination</strong>
                  <span>{user.destination || 'Not provided'}</span>
                </div>
                <div className="profile-quick-item">
                  <strong>Trip</strong>
                  <span>{user.tripDurationDays ? `${user.tripDurationDays} days` : 'Not provided'}</span>
                </div>
                <div className="profile-quick-item">
                  <strong>Phone</strong>
                  <span>{user.phone || 'Not provided'}</span>
                </div>
                <div className="profile-quick-item">
                  <strong>Traveler ID</strong>
                  <span>{user.travelerId || 'Pending'}</span>
                </div>
              </div>
            </div>

            <div className="traveler-pass-card">
            <div className="traveler-pass-header">
              <div>
                <h2>Profile Details</h2>
                <p>Saved traveler information used by the QR identity page</p>
              </div>
            </div>

            <div className="traveler-pass-grid">
              <div>
                <strong>Name</strong>
                <span>{displayName}</span>
              </div>
              <div>
                <strong>Age</strong>
                <span>{user.age || 'Not provided'}</span>
              </div>
              <div>
                <strong>Phone</strong>
                <span>{user.phone || 'Not provided'}</span>
              </div>
              <div>
                <strong>Destination</strong>
                <span>{user.destination || 'Not provided'}</span>
              </div>
              <div>
                <strong>Trip Duration</strong>
                <span>{user.tripDurationDays ? `${user.tripDurationDays} days` : 'Not provided'}</span>
              </div>
              <div>
                <strong>Blood Group</strong>
                <span>{user.bloodGroup || 'Not provided'}</span>
              </div>
              <div>
                <strong>Health Details</strong>
                <span>{user.medicalConditions || 'None shared'}</span>
              </div>
              <div>
                <strong>Aadhaar</strong>
                <span>{aadhaarDisplay}</span>
              </div>
            </div>

            <div className="traveler-pass-preferences">
              <strong>Travel Preferences</strong>
              <div className="preference-grid">
                {user.travelPreferences?.length > 0 ? user.travelPreferences.map((item) => (
                  <div key={item} className="preference-chip selected">
                    <span>{item}</span>
                  </div>
                )) : <span>No preferences shared</span>}
              </div>
            </div>

            <div className="photo-preview traveler-qr-panel">
              {qrCodeUrl ? <img src={qrCodeUrl} alt="Traveler QR code" /> : <span>QR will appear after profile save</span>}
              {publicCardUrl && <a className="auth-link-button" href={publicCardUrl} target="_blank" rel="noreferrer">Open public traveler page</a>}
            </div>

            <div className="profile-links-panel">
              <button type="button" className="auth-link-button" onClick={() => navigate('/#home')}>Go to Home</button>
              <button type="button" className="auth-link-button" onClick={() => navigate('/#help')}>Help & Support</button>
              <button type="button" className="auth-link-button" onClick={() => navigate('/#alerts')}>Alerts</button>
            </div>

            <div className="auth-actions">
              <button type="button" className="auth-submit secondary" onClick={() => navigate('/profile-setup')}>Edit traveler info</button>
              <button type="button" className="auth-submit" onClick={handleLogout}>Logout</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
