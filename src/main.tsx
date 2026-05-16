
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
  } catch (err) {
    console.error("Main.tsx: Render error", err);
  }
}
