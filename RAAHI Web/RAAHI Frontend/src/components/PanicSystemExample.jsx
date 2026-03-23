import React, { useState, useEffect } from 'react';
import { sendPanicAlert, listenToAllAlerts, formatTimestamp } from '../services/panicService';

/**
 * Example Usage Component - Demonstrates panic system functionality
 * This shows how to use both sendPanicAlert and listenToAllAlerts functions
 */
const PanicSystemExample = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [lastSentAlert, setLastSentAlert] = useState(null);

  useEffect(() => {
    console.log('📡 Example: Setting up real-time listener...');
    
    // Example usage of listenToAllAlerts function
    const unsubscribe = listenToAllAlerts((newAlerts) => {
      console.log('📊 Example: Received alerts update:', newAlerts);
      setAlerts(newAlerts);
      setIsLoading(false);
    });

    // Cleanup listener on component unmount
    return () => {
      console.log('🧹 Example: Cleaning up listener');
      unsubscribe();
    };
  }, []);

  // Example usage of sendPanicAlert function
  const handleTestPanicAlert = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      console.log('🚨 Example: Sending test panic alert...');
      
      // Example coordinates (Delhi, India)
      const testLatitude = 28.6139;
      const testLongitude = 77.2090;
      
      // Call sendPanicAlert function
      const alertId = await sendPanicAlert(testLatitude, testLongitude);
      
      console.log('✅ Example: Test panic alert sent successfully!', alertId);
      
      setLastSentAlert({
        id: alertId,
        latitude: testLatitude,
        longitude: testLongitude,
        timestamp: new Date()
      });
      
      alert(`🚨 Test panic alert sent successfully!\n\nAlert ID: ${alertId}\nLocation: ${testLatitude}, ${testLongitude}`);
      
    } catch (error) {
      console.error('❌ Example: Failed to send test panic alert:', error);
      alert('Failed to send test panic alert: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleTestPanicAlertWithCurrentLocation = async () => {
    if (isSending) return;
    
    setIsSending(true);
    
    try {
      console.log('🌍 Example: Getting current location for panic alert...');
      
      // Get user's current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });
      
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      
      console.log('📍 Example: Got current location:', { latitude, longitude });
      
      // Call sendPanicAlert function with current location
      const alertId = await sendPanicAlert(latitude, longitude);
      
      console.log('✅ Example: Current location panic alert sent!', alertId);
      
      setLastSentAlert({
        id: alertId,
        latitude: latitude,
        longitude: longitude,
        timestamp: new Date()
      });
      
      alert(`🚨 Current location panic alert sent!\n\nAlert ID: ${alertId}\nLocation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
    } catch (error) {
      console.error('❌ Example: Failed to send current location panic alert:', error);
      
      if (error.message.includes('User denied') || error.code === 1) {
        alert('Location access denied. Sending with default coordinates...');
        // Fallback to default coordinates
        const alertId = await sendPanicAlert(0, 0);
        setLastSentAlert({
          id: alertId,
          latitude: 0,
          longitude: 0,
          timestamp: new Date()
        });
      } else {
        alert('Failed to send panic alert: ' + error.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🚨 Panic System Example</h2>
        <div className="animate-pulse">
          <div className="text-gray-600">Loading panic alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🚨 Panic System Example</h2>
      
      {/* Example Usage Buttons */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">Example Usage - sendPanicAlert()</h3>
        <div className="space-y-4">
          <div>
            <button
              onClick={handleTestPanicAlert}
              disabled={isSending}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isSending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
            >
              {isSending ? '⏳ Sending...' : '🚨 Send Test Panic Alert (Delhi)'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Calls: <code>sendPanicAlert(28.6139, 77.2090)</code>
            </p>
          </div>
          
          <div>
            <button
              onClick={handleTestPanicAlertWithCurrentLocation}
              disabled={isSending}
              className={`px-6 py-3 rounded-lg font-medium text-white ${
                isSending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } transition-colors`}
            >
              {isSending ? '⏳ Getting Location...' : '📍 Send Alert with Current Location'}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Gets GPS location then calls: <code>sendPanicAlert(lat, lng)</code>
            </p>
          </div>
        </div>
        
        {lastSentAlert && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <h4 className="font-medium text-green-800">Last Sent Alert:</h4>
            <p className="text-sm text-green-700">
              ID: {lastSentAlert.id}<br/>
              Location: {lastSentAlert.latitude}, {lastSentAlert.longitude}<br/>
              Time: {formatTimestamp(lastSentAlert.timestamp)}
            </p>
          </div>
        )}
      </div>

      {/* Example Usage - Real-time Listener */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-green-800">
          Example Usage - listenToAllAlerts() 
          <span className="ml-2 text-sm font-normal text-green-600">
            (Auto-refresh: Real-time listener active)
          </span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This component automatically listens to all panic alerts from all users using: 
          <code className="bg-gray-200 px-2 py-1 rounded">listenToAllAlerts(callback)</code>
        </p>
        
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-2">All Panic Alerts ({alerts.length})</h4>
          
          {alerts.length === 0 ? (
            <p className="text-gray-500 italic">No panic alerts yet. Send one using the buttons above!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-medium text-gray-700">User ID</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Latitude</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Longitude</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Time</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.slice(0, 10).map((alert) => (
                    <tr key={alert.id} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">
                        {alert.userId.slice(0, 8)}...
                      </td>
                      <td className="px-3 py-2">
                        {alert.latitude ? alert.latitude.toFixed(6) : 'N/A'}
                      </td>
                      <td className="px-3 py-2">
                        {alert.longitude ? alert.longitude.toFixed(6) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {formatTimestamp(alert.timestampDate)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.status === 'active' ? 'bg-red-100 text-red-800' : 
                          alert.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alerts.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">
                  Showing first 10 alerts. Total: {alerts.length}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Examples */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📝 Production Code Examples</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">1. Sending a Panic Alert:</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { sendPanicAlert } from './services/panicService';

// Example 1: With specific coordinates
const alertId = await sendPanicAlert(28.6139, 77.2090);
console.log('Alert sent:', alertId);

// Example 2: With user's current location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  const alertId = await sendPanicAlert(latitude, longitude);
  console.log('Current location alert sent:', alertId);
});`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">2. Listening to All Alerts (Real-time):</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { listenToAllAlerts } from './services/panicService';

// Set up real-time listener
const unsubscribe = listenToAllAlerts((alerts) => {
  console.log('Received alerts:', alerts);
  setAlerts(alerts); // Update state
});

// Clean up listener when component unmounts
return () => unsubscribe();`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanicSystemExample;