import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyTravelerRecord } from './utils/travelerLedger';
import './styles/auth.css';

const TravelerPass = () => {
  const { travelerId } = useParams();
  const [status, setStatus] = useState({ loading: true, valid: false, record: null });

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      const result = await verifyTravelerRecord(travelerId);
      if (isMounted) {
        setStatus({ loading: false, ...result });
      }
    };

    runVerification();
    return () => {
      isMounted = false;
    };
  }, [travelerId]);

  if (status.loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-form">
            <div className="auth-form-header">
              <h2>Verifying Traveler</h2>
              <p>Checking credential integrity...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status.record) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-form">
            <div className="auth-alert auth-alert-error">
              <p>Traveler credential not found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { record } = status;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-copy">
          <p className="auth-eyebrow">RAAHI Verify</p>
          <h1>{status.valid ? 'Verified Traveler' : 'Credential Warning'}</h1>
          <p className="auth-subtitle">
            {status.valid
              ? 'This traveler card matches the current local credential ledger.'
              : 'The traveler record was found, but the credential chain did not verify cleanly.'}
          </p>
          <div className="auth-tip-list">
            <div>Traveler ID: {record.travelerId}</div>
            <div>Issued: {new Date(record.issuedAt).toLocaleString()}</div>
            <div>Last updated: {new Date(record.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        <div className="auth-form">
          <div className={`auth-alert ${status.valid ? 'auth-alert-success' : 'auth-alert-error'}`}>
            <p>{status.valid ? 'Credential chain valid' : 'Credential chain invalid'}</p>
          </div>

          <div className="traveler-pass-card">
            <div className="traveler-pass-header">
              <img
                src={record.profilePhoto?.dataUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.fullName || 'Traveler')}&background=0f766e&color=fff&size=128`}
                alt={record.fullName}
              />
              <div>
                <h2>{record.fullName}</h2>
                <p>{record.role === 'tourist_department' ? 'Tourism Department' : 'Traveler'}</p>
              </div>
            </div>

            <div className="traveler-pass-grid">
              <div>
                <strong>Name</strong>
                <span>{record.fullName || 'Not provided'}</span>
              </div>
              <div>
                <strong>Age</strong>
                <span>{record.age || 'Not provided'}</span>
              </div>
              <div>
                <strong>Email</strong>
                <span>{record.email || 'Not provided'}</span>
              </div>
              <div>
                <strong>Phone</strong>
                <span>{record.phone || 'Not provided'}</span>
              </div>
              <div>
                <strong>Where Travelling</strong>
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
                <strong>Traveler ID</strong>
                <span>{record.travelerId}</span>
              </div>
              <div>
                <strong>Aadhaar</strong>
                <span>{record.aadhaarMasked || 'Not provided'} {record.aadhaarVerified ? '(verified)' : '(unverified)'}</span>
              </div>
              <div>
                <strong>Ledger Hash</strong>
                <span className="hash-text">{record.blockHash}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelerPass;
