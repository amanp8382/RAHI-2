// Debug logging utility for map troubleshooting
class DebugLogger {
  constructor() {
    this.logs = [];
    this.isEnabled = process.env.NODE_ENV === 'development';
    this.startTime = Date.now();
  }

  log(category, message, data = null) {
    if (!this.isEnabled) return;

    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      category,
      message,
      data,
      time: new Date().toLocaleTimeString()
    };

    this.logs.push(logEntry);
    
    // Color coding for different categories
    const colors = {
      'MAP': '#2563eb', // blue
      'API': '#059669', // green
      'ERROR': '#dc2626', // red
      'LOCATION': '#7c3aed', // purple
      'NETWORK': '#ea580c', // orange
      'DIAGNOSTICS': '#0891b2' // cyan
    };

    const color = colors[category] || '#6b7280';
    
    console.log(
      `%c[${category}] ${message}`,
      `color: ${color}; font-weight: bold; background: ${color}15; padding: 2px 6px; border-radius: 3px;`,
      data || ''
    );
  }

  error(category, message, error = null) {
    this.log(category, `❌ ${message}`, error);
    if (error) {
      console.error(`[${category}] Full error:`, error);
    }
  }

  success(category, message, data = null) {
    this.log(category, `✅ ${message}`, data);
  }

  warning(category, message, data = null) {
    this.log(category, `⚠️ ${message}`, data);
  }

  info(category, message, data = null) {
    this.log(category, `ℹ️ ${message}`, data);
  }

  // Map-specific logging methods
  mapLoad(status, details = null) {
    if (status === 'success') {
      this.success('MAP', 'Google Maps loaded successfully', details);
    } else if (status === 'error') {
      this.error('MAP', 'Google Maps failed to load', details);
    } else if (status === 'loading') {
      this.info('MAP', 'Loading Google Maps...', details);
    }
  }

  apiKey(isValid, key = null) {
    if (isValid) {
      this.success('API', 'Google Maps API key is valid');
    } else {
      this.error('API', 'Google Maps API key is invalid or missing', { 
        key: key ? `${key.substring(0, 10)}...` : 'undefined' 
      });
    }
  }

  location(type, data) {
    if (type === 'success') {
      this.success('LOCATION', 'Location obtained', {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: data.accuracy
      });
    } else if (type === 'error') {
      this.error('LOCATION', 'Location error', data);
    } else if (type === 'permission') {
      this.warning('LOCATION', 'Location permission status', data);
    }
  }

  network(status, url = null, error = null) {
    if (status === 'success') {
      this.success('NETWORK', `Network request successful: ${url}`);
    } else if (status === 'error') {
      this.error('NETWORK', `Network request failed: ${url}`, error);
    } else if (status === 'timeout') {
      this.warning('NETWORK', `Network request timeout: ${url}`);
    }
  }

  componentState(component, state, data = null) {
    this.info('DIAGNOSTICS', `${component} state: ${state}`, data);
  }

  // Get all logs for debugging
  getAllLogs() {
    return this.logs;
  }

  // Export logs as text for sharing
  exportLogs() {
    return this.logs.map(log => 
      `[${log.time}] [${log.category}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
  }

  // Clear all logs
  clear() {
    this.logs = [];
    this.startTime = Date.now();
    console.clear();
    this.info('DIAGNOSTICS', 'Debug logs cleared');
  }

  // Environment info
  logEnvironmentInfo() {
    this.info('DIAGNOSTICS', 'Environment information', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      geolocationSupported: 'geolocation' in navigator,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      localStorageSupported: typeof(Storage) !== "undefined",
      screenSize: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentUrl: window.location.href
    });
  }
}

// Create a singleton instance
const debugLogger = new DebugLogger();

// Export for use in components
export default debugLogger;