import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          border: '2px dashed #e2e8f0',
          borderRadius: '12px',
          backgroundColor: '#fef2f2',
          textAlign: 'center',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
          <h3 style={{ 
            color: '#dc2626', 
            fontSize: '1.5rem', 
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            Map Component Error
          </h3>
          <p style={{ 
            color: '#7f1d1d', 
            marginBottom: '1.5rem',
            maxWidth: '400px',
            lineHeight: '1.6'
          }}>
            {this.props.fallbackMessage || 'Something went wrong with the map component. This might be due to API configuration or network issues.'}
          </p>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '1rem' }}>
              🔧 Troubleshooting Steps:
            </h4>
            <ul style={{ 
              textAlign: 'left', 
              color: '#6b7280', 
              fontSize: '0.9rem',
              margin: '0',
              paddingLeft: '1.5rem'
            }}>
              <li>Check your internet connection</li>
              <li>Verify Google Maps API key configuration</li>
              <li>Ensure location permissions are enabled</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              🔄 Reload Page
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              🔁 Try Again
            </button>
          </div>

          {/* Development mode error details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ 
              marginTop: '2rem', 
              maxWidth: '100%', 
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#495057'
              }}>
                🐛 Error Details (Development)
              </summary>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                fontSize: '0.8rem',
                color: '#dc2626',
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                overflowX: 'auto'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;