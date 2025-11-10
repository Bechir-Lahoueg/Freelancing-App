import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 max-w-2xl">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              ⚠️ Une erreur s'est produite
            </h1>
            <p className="text-slate-300 mb-6">
              {this.state.error && this.state.error.toString()}
            </p>
            <details className="mb-6 text-slate-400 text-sm">
              <summary className="cursor-pointer font-semibold text-slate-300 mb-2">
                Détails techniques
              </summary>
              <pre className="bg-slate-900/50 p-4 rounded overflow-auto text-xs">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Retourner à l'accueil
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
