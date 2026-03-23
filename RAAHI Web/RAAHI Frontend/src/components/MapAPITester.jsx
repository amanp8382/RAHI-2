import React, { useState, useEffect } from 'react';

const MapAPITester = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [apiDetails, setApiDetails] = useState({});
  const [testResults, setTestResults] = useState([]);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const addTestResult = (test, result, status) => {
    setTestResults(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      test,
      result,
      status
    }]);
  };

  useEffect(() => {
    const runTests = async () => {
      // Test 1: Check API key format and basic info
      const keyDetails = {
        key: API_KEY,
        length: API_KEY?.length || 0,
        format: API_KEY?.startsWith('AIza') ? 'Valid format' : 'Invalid format',
        present: !!API_KEY
      };
      setApiDetails(keyDetails);

      if (!API_KEY) {
        setApiStatus('ERROR: API key missing');
        addTestResult('API Key Check', 'No API key found in environment variables', 'error');
        return;
      }

      addTestResult('API Key Check', `Key present: ${API_KEY.substring(0, 8)}..., Length: ${API_KEY.length}`, 'success');

      // Test 2: Try to load Google Maps JavaScript API
      try {
        const scriptLoaded = await new Promise((resolve, reject) => {
          // Check if already loaded
          if (window.google?.maps) {
            resolve(true);
            return;
          }

          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry`;
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Script failed to load'));
          
          // Handle auth failure
          window.gm_authFailure = () => reject(new Error('Authentication failed'));
          
          document.head.appendChild(script);
        });

        if (scriptLoaded) {
          setApiStatus('SUCCESS: Google Maps API loaded');
          addTestResult('JavaScript API', 'Successfully loaded Google Maps JavaScript API', 'success');
        }
      } catch (error) {
        setApiStatus(`ERROR: ${error.message}`);
        addTestResult('JavaScript API', `Failed to load: ${error.message}`, 'error');
      }

      // Test 3: Try geocoding API
      try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Delhi,India&key=${API_KEY}`);
        const data = await response.json();
        
        if (data.status === 'OK') {
          addTestResult('Geocoding API', 'Successfully geocoded Delhi location', 'success');
        } else {
          addTestResult('Geocoding API', `Failed: ${data.status} - ${data.error_message || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        addTestResult('Geocoding API', `Network error: ${error.message}`, 'error');
      }
    };

    runTests();
  }, [API_KEY]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      padding: '2rem',
      margin: '1rem 0',
      border: '2px solid #cbd5e1'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>🔧 Google Maps API Diagnostics</h2>
      
      {/* API Status */}
      <div style={{
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        backgroundColor: apiStatus.includes('SUCCESS') ? '#d4edda' : 
                        apiStatus.includes('ERROR') ? '#f8d7da' : '#fff3cd',
        color: apiStatus.includes('SUCCESS') ? '#155724' : 
               apiStatus.includes('ERROR') ? '#721c24' : '#856404',
        border: `1px solid ${apiStatus.includes('SUCCESS') ? '#c3e6cb' : 
                            apiStatus.includes('ERROR') ? '#f5c6cb' : '#ffeaa7'}`
      }}>
        <strong>Status:</strong> {apiStatus}
      </div>

      {/* API Key Details */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>API Key Information</h3>
        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
          <p><strong>Present:</strong> {apiDetails.present ? '✅ Yes' : '❌ No'}</p>
          {apiDetails.present && (
            <>
              <p><strong>Length:</strong> {apiDetails.length}</p>
              <p><strong>Format:</strong> {apiDetails.format}</p>
              <p><strong>Preview:</strong> {API_KEY?.substring(0, 8)}...</p>
            </>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Test Results</h3>
        <div style={{ background: '#ffffff', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {testResults.length === 0 ? (
            <p style={{ padding: '1rem', margin: 0, color: '#6b7280' }}>Running tests...</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} style={{
                padding: '0.75rem 1rem',
                borderBottom: index < testResults.length - 1 ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                    {result.status === 'success' ? '✅' : '❌'} {result.test}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {result.result}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '1rem' }}>
                  {result.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {apiStatus.includes('ERROR') && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>💡 Troubleshooting Tips:</h4>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#a16207', fontSize: '0.9rem' }}>
            <li>Check if the API key is correct in your .env file</li>
            <li>Ensure the API key has Google Maps JavaScript API enabled</li>
            <li>Verify that your domain/localhost is whitelisted for this API key</li>
            <li>Check if billing is enabled for your Google Cloud project</li>
            <li>Make sure the API key hasn't exceeded usage limits</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapAPITester;