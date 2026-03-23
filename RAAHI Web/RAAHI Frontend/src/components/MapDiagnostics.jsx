import React, { useState, useEffect } from 'react';

const MapDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    geolocation: 'checking',
    apiKey: 'checking',
    network: 'checking',
    browserSupport: 'checking'
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const results = {};

      // Check geolocation
      if (navigator.geolocation) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              () => {
                results.geolocation = '✅ Available';
                resolve();
              },
              (error) => {
                results.geolocation = `❌ Error: ${error.message}`;
                resolve();
              },
              { timeout: 5000 }
            );
          });
        } catch {
          results.geolocation = '❌ Failed to check';
        }
      } else {
        results.geolocation = '❌ Not supported';
      }

      // Check API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        results.apiKey = '❌ Missing from environment';
      } else if (apiKey === 'your_google_maps_api_key_here') {
        results.apiKey = '❌ Default placeholder value';
      } else if (apiKey.length < 10) {
        results.apiKey = '❌ Too short, likely invalid';
      } else {
        results.apiKey = `✅ Configured (${apiKey.substring(0, 8)}...)`;
      }

      // Check network
      try {
        const response = await fetch('https://maps.googleapis.com/maps/api/js?key=' + apiKey + '&v=3', { method: 'HEAD' });
        if (response.ok) {
          results.network = '✅ Google Maps API accessible';
        } else {
          results.network = `❌ API returned status: ${response.status}`;
        }
      } catch (error) {
        results.network = `❌ Network error: ${error.message}`;
      }

      // Check browser support
      const supportedFeatures = [];
      if (navigator.geolocation) supportedFeatures.push('Geolocation');
      if (window.fetch) supportedFeatures.push('Fetch API');
      if (window.Promise) supportedFeatures.push('Promises');
      if (window.localStorage) supportedFeatures.push('Local Storage');
      
      results.browserSupport = supportedFeatures.length === 4 
        ? `✅ Full support (${supportedFeatures.join(', ')})`
        : `⚠️ Partial support (Missing: ${['Geolocation', 'Fetch API', 'Promises', 'Local Storage'].filter(f => !supportedFeatures.includes(f)).join(', ')})`;

      setDiagnostics(results);
    };

    runDiagnostics();
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      padding: '2rem',
      border: '2px solid #cbd5e1',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#1e293b',
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
        fontWeight: '700'
      }}>
        🔧 Map System Diagnostics
      </h2>

      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            📍 Geolocation Support
          </span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: '#f8fafc'
          }}>
            {diagnostics.geolocation}
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            🔑 Google Maps API Key
          </span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: '#f8fafc'
          }}>
            {diagnostics.apiKey}
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            🌐 Network Connectivity
          </span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: '#f8fafc'
          }}>
            {diagnostics.network}
          </span>
        </div>

        <div style={{
          background: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#374151' }}>
            🖥️ Browser Support
          </span>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.9rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: '#f8fafc'
          }}>
            {diagnostics.browserSupport}
          </span>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px'
      }}>
        <h4 style={{ 
          margin: '0 0 0.75rem 0', 
          color: '#1e40af', 
          fontSize: '1rem',
          fontWeight: '600' 
        }}>
          💡 Environment Information
        </h4>
        <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
          <div><strong>Mode:</strong> {import.meta.env.MODE}</div>
          <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</div>
          <div><strong>App Name:</strong> {import.meta.env.VITE_APP_NAME || 'Not set'}</div>
          <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</div>
        </div>
      </div>

      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#64748b'
      }}>
        <p style={{ margin: '0' }}>
          🔄 Diagnostics refresh automatically on page load. 
          If you see issues, check your Google Maps API key configuration and billing.
        </p>
      </div>
    </div>
  );
};

export default MapDiagnostics;