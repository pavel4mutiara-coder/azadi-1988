
import React, { useState, useEffect } from 'react';
import { storage, auth } from '../firebase';
import { ShieldAlert, Loader2, CheckCircle, AlertCircle, Terminal, Trash2, RefreshCw, Activity, Database } from 'lucide-react';
import { uploadService, UploadLog } from '../services/uploadService';
import { RawUploaderTest } from './RawUploaderTest';

export const StorageDiagnostics: React.FC = () => {
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [health, setHealth] = useState({
    auth: false,
    storage: false,
    network: navigator.onLine
  });

  useEffect(() => {
    const unsub = uploadService.subscribe(setLogs);
    checkHealth();
    return unsub;
  }, []);

  const checkHealth = () => {
    setHealth({
      auth: !!auth.currentUser,
      storage: !!storage,
      network: navigator.onLine
    });
  };

  const runTest = async () => {
    setIsTesting(true);
    uploadService.clearLogs();
    try {
      const dummy = new Blob(['diagnostic-test-' + Date.now()], { type: 'text/plain' });
      const testFile = new File([dummy], `test-${Date.now()}.txt`, { type: 'text/plain' });
      await uploadService.upload(testFile, 'diagnostics');
    } catch (e) {
      // Error logged by service
    } finally {
      setIsTesting(false);
      checkHealth();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
            <ShieldAlert className="text-emerald-500" size={32} />
            AI Diagnostic Engine
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time upload monitoring & storage health</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => uploadService.clearLogs()}
            className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear Logs"
          >
            <Trash2 size={24} />
          </button>
          <button 
            onClick={runTest}
            disabled={isTesting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase flex items-center gap-3 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
            {isTesting ? 'Testing...' : 'Run Self-Test'}
          </button>
        </div>
      </div>

      <RawUploaderTest />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${health.storage ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30' : 'bg-amber-50 border-amber-100'}`}>
          <Database size={24} className={health.storage ? 'text-emerald-500' : 'text-amber-500'} />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Storage Status</div>
            <div className="font-bold text-slate-900 dark:text-white">{health.storage ? 'Connected' : 'Unavailable'}</div>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${health.auth ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30' : 'bg-rose-50 border-rose-100'}`}>
          <CheckCircle size={24} className={health.auth ? 'text-emerald-500' : 'text-rose-500'} />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auth Status</div>
            <div className="font-bold text-slate-900 dark:text-white">{health.auth ? 'Authenticated' : 'Locked'}</div>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border flex items-center gap-4 transition-all ${health.network ? 'bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/30' : 'bg-slate-50 border-slate-100'}`}>
          <Activity size={24} className={health.network ? 'text-blue-500' : 'text-slate-400'} />
          <div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Network Node</div>
            <div className="font-bold text-slate-900 dark:text-white">{health.network ? 'Online' : 'Offline'}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">
          <Terminal size={14} />
          Diagnostic Logs
        </div>
        <div className="bg-slate-950 rounded-[2rem] p-6 font-mono text-[11px] h-64 overflow-y-auto space-y-2 custom-scrollbar border border-slate-800">
          {logs.length === 0 && <div className="text-slate-600 italic">Engine idle. Waiting for upload events...</div>}
          {logs.map((log) => (
            <div 
              key={log.id} 
              className={`flex gap-3 p-2 rounded-lg ${
                log.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 
                log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 
                'text-slate-400'
              }`}
            >
              <span className="opacity-30 shrink-0 font-bold">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
              <div className="flex-1">
                <div className="font-black uppercase tracking-tight text-[10px] mb-0.5">{log.message}</div>
                {log.details && (
                  <pre className="opacity-70 overflow-x-auto text-[9px] mt-1 bg-black/40 p-2 rounded border border-white/5 whitespace-pre-wrap">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
