
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/index.css';

console.log("Main.tsx: Module evaluation started...");
(window as any).__REACT_STARTED__ = true;

console.log("Main.tsx: Mounting App...");

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log("Main.tsx: Rendered.");
    
    // Register Service Worker for PWA stability and offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(registration => {
            console.log('SW registered:', registration);
            
            // Check for updates every hour
            setInterval(() => {
              registration.update();
            }, 1000 * 60 * 60);

            // If an update is found and installed, reload the page
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available
                    if (window.confirm('A new version is available. Update now?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('SW registration failed:', error);
          });
      });

      // Handle controller change (e.g. from skipWaiting)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  } catch (err) {
    console.error("Main.tsx: Render error", err);
  }
}
