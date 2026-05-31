
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Auto-recovery for chunk-load/failed dynamic imports
    const errorMessage = error?.message || '';
    const isChunkError = 
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('ChunkLoadError') ||
      errorMessage.toLowerCase().includes('dynamically imported');

    if (isChunkError) {
      console.warn('Dynamic import chunk error detected in ErrorBoundary. Attempting auto-recovery...');
      const recoveryKey = 'chunk_error_reload_count';
      const reloadVal = sessionStorage.getItem(recoveryKey);
      const reloadCount = reloadVal ? parseInt(reloadVal, 10) : 0;
      
      if (reloadCount < 2) {
        sessionStorage.setItem(recoveryKey, String(reloadCount + 1));
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 mb-6 shadow-inner">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 font-medium">
            The application encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
          </p>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg mb-8 overflow-auto max-h-40">
            <code className="text-xs text-rose-500 font-mono break-all text-left block">
              {this.state.error?.toString()}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <RotateCcw size={20} /> Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
