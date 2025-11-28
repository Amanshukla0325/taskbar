import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Also log to console for server-side visibility
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, fontFamily: 'system-ui, Roboto, Arial' }}>
          <h1 style={{ color: '#b91c1c' }}>There was an error loading the app</h1>
          <p style={{ color: '#374151' }}>
            Please check the console or contact the developer with the error details below:
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111827', color: '#f8fafc', padding: 12, borderRadius: 8 }}>
            {(this.state.error && this.state.error.toString()) || 'Unknown error'}
            {this.state.info && '\n' + this.state.info.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
