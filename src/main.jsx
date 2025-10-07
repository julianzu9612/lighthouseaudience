import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('=== Dashboard Loading ===');

// Catch all errors for debugging
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno, e.colno);
  console.error('Stack:', e.error?.stack);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE REJECTION:', e.reason);
});

console.log('Mounting React application...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('#root element not found in DOM');
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  console.log('✓ React mounted successfully');
} catch (err) {
  console.error('✗ FATAL ERROR mounting React:', err);
  // Show error on page
  document.body.innerHTML = `
    <div style="
      padding: 40px;
      background: #1a1a1a;
      color: #ff0000;
      font-family: monospace;
      min-height: 100vh;
    ">
      <h1 style="color: #ff0000; margin-bottom: 20px;">🚨 Dashboard Failed to Load</h1>
      <div style="
        background: #000;
        border: 2px solid #ff0000;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
      ">
        <strong>Error:</strong> ${err.message}
        <pre style="margin-top: 10px; color: #ffaa00;">${err.stack || 'No stack trace'}</pre>
      </div>
      <p style="color: #666;">
        Check the browser console (F12) for more details.
      </p>
    </div>
  `;
}
