import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 React ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen">
          <div className="error-boundary-card">
            <span className="error-boundary-icon">⚠️</span>
            <h2>Something went wrong</h2>
            <p>
              An unexpected error occurred while rendering this view. Don't worry, 
              your data is safe!
            </p>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="error-details-box">
                {this.state.error.toString()}
              </pre>
            )}

            <button onClick={this.handleReload} className="btn-primary">
              🔄 Return to Safe Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
