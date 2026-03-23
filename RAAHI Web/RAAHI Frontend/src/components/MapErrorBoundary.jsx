import React from 'react';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Map Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '2px solid #fecaca',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          margin: '1rem 0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️❌</div>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            color: '#dc2626',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Map Component Error
          </h3>
          <p style={{ 
            margin: '0 0 1rem 0', 
            color: '#7f1d1d',
            fontSize: '1rem'
          }}>
            The map component encountered an error and crashed. This might be due to:
          </p>
          <ul style={{
            textAlign: 'left',
            color: '#7f1d1d',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
            fontSize: '0.9rem'
          }}>
            <li>Google Maps API key issues</li>
            <li>Network connectivity problems</li>
            <li>Browser compatibility issues</li>
            <li>JavaScript errors in the map code</li>
          </ul>
          
          {this.state.error && (
            <details style={{
              background: 'rgba(127, 29, 29, 0.1)',
              border: '1px solid rgba(127, 29, 29, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                color: '#991b1b',
                marginBottom: '0.5rem'
              }}>
                🔍 Technical Error Details
              </summary>
              <pre style={{
                fontSize: '0.75rem',
                color: '#7f1d1d',
                overflow: 'auto',
                maxHeight: '200px',
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '0.5rem',
                borderRadius: '4px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔄 Try Again
          </button>
          
          <div style={{
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: '#991b1b',
            fontStyle: 'italic'
          }}>
            If the problem persists, check the browser console for more details
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;