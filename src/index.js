import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Basic window.onerror fallback to capture early errors before React mounts
window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global error captured:', message, source, lineno, colno, error);
  // Optionally render an error UI - but React mounts immediately below and the ErrorBoundary handles most cases
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Nice small check to help debug blank page: update the status banner once React has mounted
try {
  const status = document.getElementById('status-banner');
  if (status) {
    status.textContent = 'App mounted';
    // fade out after a short delay so users don't see the banner during normal uses
    setTimeout(() => { status.style.display = 'none'; }, 600);
  }
} catch (err) {
  console.error('Error updating status banner', err);
}
