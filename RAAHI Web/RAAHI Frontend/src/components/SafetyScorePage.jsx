import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { saveTravelerLiveLocation } from '../utils/liveLocationStore';
import '../styles/auth.css';

const SafetyScorePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Requesting live location...');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isLoading && user?.userType !== 'tourist') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (!user?.travelerId) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return undefined;
    }

    const fetchPrediction = async (coords) => {
      try {
        setError('');
        setStatus(`Live location active (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`);
        saveTravelerLiveLocation(user.travelerId, {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
          address: user.destination || 'Current traveler location'
        });

        const response = await apiService.ai.getLiveSafetyScore({
          lat: coords.latitude,
          lng: coords.longitude,
          locationName: ''
        });

        setPrediction(response.prediction);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Failed to load safety score.');
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        fetchPrediction(position.coords);
      },
      () => {
        setError('Location permission denied or unavailable.');
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
  }, [user?.travelerId, user?.destination]);

  const score = prediction?.score ?? 0;
  const tone = score >= 80 ? 'safe' : score >= 60 ? 'watch' : score >= 40 ? 'elevated' : 'danger';

  return (
    <div className="auth-page dashboard-page">
      <div className="dashboard-shell">
        <section className="dashboard-hero">
          <div className="dashboard-hero-copy">
            <p className="auth-eyebrow">RAAHI Safety Score</p>
            <h1>{user?.fullName || 'Traveler'}</h1>
            <p className="auth-subtitle">This page uses your live location and your trained ML model to predict travel safety in real time.</p>
            <div className="hero-chip-row">
              <span className="hero-chip">{status}</span>
              <span className="hero-chip">{user?.destination || 'Destination pending'}</span>
            </div>
          </div>

          <div className={`safety-score-card ${tone}`}>
            <div className="safety-score-header">
              <div>
                <p className="safety-score-label">Predicted Safety</p>
                <h2>{prediction?.label || 'Waiting for ML model'}</h2>
              </div>
              <div className="safety-score-value">
                <span>{prediction?.score ?? '--'}</span>
                <small>/100</small>
              </div>
            </div>

            <p className="safety-score-summary">
              {prediction?.summary || 'As soon as live GPS is available, the backend will run the trained ML model and show the prediction here.'}
            </p>

            <div className="safety-score-meta">
              <div className="safety-meta-item">
                <strong>Threat Level</strong>
                <span>{prediction?.threatLevel || 'Pending'}</span>
              </div>
              <div className="safety-meta-item">
                <strong>Model Confidence</strong>
                <span>{prediction?.confidence ? `${Math.round(prediction.confidence * 100)}%` : 'Pending'}</span>
              </div>
              <div className="safety-meta-item">
                <strong>Destination</strong>
                <span>{prediction?.resolvedLocationName || user?.destination || 'Pending'}</span>
              </div>
            </div>

            <div className="safety-progress-track">
              <div className="safety-progress-fill" style={{ width: `${score}%` }}></div>
            </div>
          </div>
        </section>

        {error && (
          <div className="auth-alert auth-alert-error">
            <p>{error}</p>
          </div>
        )}

        <section className="dashboard-grid-modern">
          <div className="dashboard-panel factor-panel" style={{ gridColumn: 'span 6' }}>
            <div className="panel-heading">
              <div>
                <p className="panel-eyebrow">Model Breakdown</p>
                <h3>Prediction Factors</h3>
              </div>
            </div>

            <div className="factor-list">
              {prediction?.factors?.length ? prediction.factors.map((factor) => (
                <div key={factor.label} className={`factor-item ${factor.impact || 'neutral'}`}>
                  <div>
                    <strong>{factor.label}</strong>
                    <span>{factor.value}</span>
                  </div>
                  <small>{factor.impact || 'neutral'}</small>
                </div>
              )) : <p className="auth-subtext">Waiting for ML factors...</p>}
            </div>
          </div>

          <div className="dashboard-panel recommendation-panel" style={{ gridColumn: 'span 6' }}>
            <div className="panel-heading">
              <div>
                <p className="panel-eyebrow">Traveler Guidance</p>
                <h3>Recommended Actions</h3>
              </div>
            </div>

            <div className="recommendation-list">
              {prediction?.recommendations?.length ? prediction.recommendations.map((item) => (
                <div key={item} className="recommendation-item">
                  <span className="recommendation-dot"></span>
                  <p>{item}</p>
                </div>
              )) : <p className="auth-subtext">Waiting for ML recommendations...</p>}
            </div>
          </div>
        </section>

        <div className="profile-links-panel">
          <button type="button" className="auth-link-button" onClick={() => navigate('/#dashboard')}>Back to Tourist Dashboard</button>
          <button type="button" className="auth-link-button" onClick={() => navigate('/#home')}>Go to Home</button>
        </div>
      </div>
    </div>
  );
};

export default SafetyScorePage;
