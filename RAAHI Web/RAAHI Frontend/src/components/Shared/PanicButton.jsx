import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PanicButton = () => {
  const [isWarning, setIsWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isTriggering, setIsTriggering] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [locationStatus, setLocationStatus] = useState('checking');
  const countdownRef = useRef(null);
  const { user } = useAuth(); // Assumes this provides the Firebase user object

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const startWarningCountdown = () => {
    if (isWarning || hasTriggered) return;
    
    // Check if user is authenticated before starting
    if (!user) {
        alert("Please log in to use the panic button.");
        return;
    }

    setIsWarning(true);
    setCountdown(30);
    setLocationStatus('checking');
    
    // Check location availability when warning starts
    checkLocationAvailability();
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          triggerPanicAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelPanic = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setIsWarning(false);
    setCountdown(30);
    setLocationStatus('checking');
    alert("Panic alert canceled.");
  };

  const checkLocationAvailability = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationStatus(`available: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setLocationStatus('unavailable: ' + error.message);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setLocationStatus('not supported');
    }
  };

  const triggerPanicAlert = async () => {
    setIsTriggering(true);
    setIsWarning(false);
    
    if (!user) {
        console.error("No user authenticated. Cannot send alert.");
        setIsTriggering(false);
        setHasTriggered(true);
        return;
    }

    try {
      console.log('📍 Requesting user location...');
      
      const position = await new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        } else {
          reject(new Error('Geolocation not supported by this browser'));
        }
      });

      const { latitude, longitude } = position.coords;
      console.log(`✅ Location acquired: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // Store the alert in Firebase Firestore
      const userId = user.uid || user.id; // Get the user's UID from the auth context
      const userDocRef = doc(db, "users", userId);
      const panicAlertsCollectionRef = collection(userDocRef, "panic_alerts");
      
      const alertData = {
        latitude: latitude,
        longitude: longitude,
        timestamp: serverTimestamp(), // Use serverTimestamp for accuracy
        // Note: You can add other data like accuracy if needed.
      };

      await addDoc(panicAlertsCollectionRef, alertData);
      
      console.log('🚨 PANIC ALERT SENT SUCCESSFULLY:', {
        alertId: 'Firebase-generated',
        location: alertData,
        timestamp: new Date().toISOString(),
        status: 'SUCCESS'
      });
      alert(`🚨 EMERGENCY ALERT SENT SUCCESSFULLY!\n\nLocation saved to database.`);

    } catch (error) {
      console.error('❌ Critical error in panic system:', error);
      
      let errorMessage = 'An unknown error occurred.';
      if (error.message.includes("Geolocation not supported")) {
        errorMessage = "Geolocation is not supported by your browser.";
      } else if (error.message.includes("User denied Geolocation")) {
        errorMessage = "Location access was denied. Please allow it for this feature.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Could not get your location in time.";
      } else {
        errorMessage = `Failed to send alert. Check your network and Firebase connection. Error: ${error.message}`;
      }
      
      alert(`⚠️ ERROR!\n\n${errorMessage}\n\nManual Action: Please contact emergency services directly.`);
    } finally {
      setIsTriggering(false);
      setHasTriggered(true);
      
      // Auto-dial emergency services as a final safety measure
      try {
        window.location.href = `tel:112`; // Universal emergency number for many regions
        console.log('📞 Emergency call initiated...');
      } catch (callError) {
        console.warn('❌ Failed to auto-dial emergency services.');
      }
      
      // Reset after 2 minutes
      setTimeout(() => {
        setHasTriggered(false);
      }, 120000);
    }
  };

  return (
    <>
      <div className="panic-button">
        <button 
          onClick={startWarningCountdown} 
          className={`panic-btn ${hasTriggered ? 'triggered' : ''} ${isWarning ? 'warning' : ''}`}
          aria-label="Emergency panic button"
          disabled={isTriggering || isWarning}
          style={{ 
            backgroundColor: hasTriggered ? '#28a745' : isWarning ? '#ffa500' : '#dc3545',
            opacity: isTriggering ? 0.7 : 1,
            cursor: (isTriggering || isWarning) ? 'not-allowed' : 'pointer',
            transform: isWarning ? 'scale(1.1)' : 'scale(1)',
            animation: isWarning ? 'pulse 1s infinite' : 'none'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m15 9-6 6"/>
            <path d="m9 9 6 6"/>
          </svg>
          <span>
            {isTriggering ? 'Sending...' : hasTriggered ? 'Alert Sent' : isWarning ? countdown : 'PANIC'}
          </span>
        </button>
      </div>

      {isWarning && (
        <div className="panic-warning-overlay">
          <div className="panic-warning-modal">
            <div className="warning-icon">⚠️</div>
            <h3>Emergency Alert Warning</h3>
            <p>You accidentally activated the panic button?</p>
            <div className="countdown-display">
              <div className="countdown-circle">
                <span className="countdown-number">{countdown}</span>
              </div>
              <p>Emergency alert will be sent in <strong>{countdown}</strong> seconds</p>
            </div>
            <div className="warning-actions">
              <button 
                onClick={cancelPanic}
                className="cancel-btn"
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                ✅ Cancel Alert
              </button>
              <button 
                onClick={triggerPanicAlert}
                className="confirm-btn"
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🚨 Send Now
              </button>
            </div>
            <div className="location-status" style={{ 
              margin: '15px 0', 
              padding: '10px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px', 
              fontSize: '12px' 
            }}>
              <p><strong>📍 Location Status:</strong></p>
              <p style={{ 
                color: locationStatus.includes('available') ? '#28a745' : 
                          locationStatus.includes('unavailable') ? '#dc3545' : '#ffc107',
                fontFamily: 'monospace',
                marginTop: '5px'
              }}>
                {locationStatus === 'checking' ? 'Checking GPS...' : locationStatus}
              </p>
            </div>
            <p className="warning-note">
              Your location will be sent to emergency services and saved to our database.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PanicButton;
