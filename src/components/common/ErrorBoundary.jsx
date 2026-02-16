//   src/components/common/ErrorBoundary.jsx

// ----- Imports -----
import React from 'react';

// ----- Main ----- 
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // log error to an external service (e.g., Sentry) in production
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-fallback">Something went wrong.</div>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;