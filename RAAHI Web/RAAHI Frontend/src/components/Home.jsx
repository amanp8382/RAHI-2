import React, { useEffect, useState } from 'react';

const Home = ({ onPageChange }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ lat: null, lon: null });

  const OPENWEATHER_API_KEY = "200577e014c1c4c3d23e9474ed18dc2c";

  // Get user's location
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Default to Delhi coordinates if geolocation fails
            setLocation({ lat: 28.6139, lon: 77.2090 });
          }
        );
      } else {
        // Default to Delhi coordinates if geolocation not supported
        setLocation({ lat: 28.6139, lon: 77.2090 });
      }
    };

    getUserLocation();
  }, []);

  // Fetch weather data
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location.lat || !location.lon) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
        );

        if (!response.ok) throw new Error('Weather data not available');

        const weatherData = await response.json();
        setWeather(weatherData);
        setError(null);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return (
    <section id="home" className="page active">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Smart Tourism, Safe Tourism
            </h1>
            <p className="hero-description">
              RAAHI Tourist Safety Monitoring & Incident Response System.
              Trusted, modern and accessible for every citizen.
            </p>
            <div className="hero-buttons">
              <a href="#register" className="btn btn-primary btn-lg" onClick={() => onPageChange('register')}>Register as Tourist</a>
              <a href="#help" className="btn btn-outline btn-lg" onClick={() => onPageChange('help')}>Help & Support</a>
            </div>
            <div className="hero-features">
              <div className="feature">
                <svg className="feature-icon secure" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                Secure
              </div>
              <div className="feature">
                <svg className="feature-icon zones" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Live Zones
              </div>
              <div className="feature">
                <svg className="feature-icon support" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                24x7 Support
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="weather-forecast">
              <div className="weather-header">
                <h3>Live Weather Forecast</h3>
                <span className="weather-location">
                  {weather?.name ? weather.name : 'Loading...'}
                </span>
              </div>
              <div className="weather-content">
                {loading ? (
                  <div className="weather-loading">
                    <div className="loading-spinner"></div>
                    <p>Getting weather data...</p>
                  </div>
                ) : error ? (
                  <div className="weather-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 9v4"/>
                      <path d="m12 17 .01 0"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                    <p>{error}</p>
                  </div>
                ) : weather ? (
                  <div className="weather-data">
                    <div className="weather-main">
                      <div className="weather-temp">{Math.round(weather.main.temp)}°C</div>
                      <div className="weather-condition">
                        <img 
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                          alt={weather.weather[0].description}
                          className="weather-icon"
                        />
                        <span>{weather.weather[0].main}</span>
                      </div>
                    </div>
                    <div className="weather-details">
                      <div className="weather-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <span>Feels like {Math.round(weather.main.feels_like)}°C</span>
                      </div>
                      <div className="weather-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
                        </svg>
                        <span>Humidity {weather.main.humidity}%</span>
                      </div>
                      <div className="weather-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                        </svg>
                        <span>Pressure {weather.main.pressure} hPa</span>
                      </div>
                      <div className="weather-detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.5 12c0 1.09-.69 2.2-1.68 2.8-.99.6-2.32.8-3.82.8s-2.83-.2-3.82-.8c-.99-.6-1.68-1.71-1.68-2.8m12 0c0-5-2-10-12-10s-12 5-12 10"/>
                        </svg>
                        <span>Wind {Math.round(weather.wind?.speed || 0)} m/s</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-header">
                <svg className="feature-card-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="m22 21-3-3m0 0L16 15m3 3 3-3m-3 3v-6"/>
                </svg>
                <h3>Digital Tourist ID</h3>
              </div>
              <p className="feature-card-description">
                QR-enabled ID for quick verification at checkpoints and services.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-header">
                <svg className="feature-card-icon orange" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>Safety Alerts</h3>
              </div>
              <p className="feature-card-description">
                Receive real-time advisories and area warnings based on your route.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-header">
                <svg className="feature-card-icon green" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <h3>Emergency Help</h3>
              </div>
              <p className="feature-card-description">
                One-tap call and WhatsApp to reach police, ambulance, and helplines.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-card-header">
                <svg className="feature-card-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
                <h3>About the Project</h3>
              </div>
              <p className="feature-card-description">
                Transparent, privacy-first, aligned with public safety objectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="why-matters">
        <div className="container">
          <div className="why-matters-grid">
            <div className="why-matters-content">
              <h2>Why it matters</h2>
              <p>
                Designed for all citizens including elderly and rural users.
                Simple language, clear icons, and accessible controls.
              </p>
            </div>
            <div className="active-alerts-card">
              <div className="active-alerts-title">Active Alerts</div>
              <ul className="alerts-list">
                <li className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot severe"></span>
                    Heavy crowd near Fort
                  </span>
                  <span className="alert-level severe">Severe</span>
                </li>
                <li className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot high"></span>
                    Road closure at Market
                  </span>
                  <span className="alert-level high">High</span>
                </li>
                <li className="alert-item">
                  <span className="alert-info">
                    <span className="alert-dot low"></span>
                    Weather advisory
                  </span>
                  <span className="alert-level low">Low</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Home;