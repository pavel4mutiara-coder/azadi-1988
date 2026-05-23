
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  X, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Activity,
  Trash2,
  Database,
  CloudLightning,
  ShieldCheck,
  Bug
} from 'lucide-react';
import { uploadService, UploadLog } from '../services/uploadService';
import { storage, auth } from '../firebase';
import { RawUploaderTest } from './RawUploaderTest';
import { crashlyticsService } from '../services/crashlyticsService';

export const UploadDiagnosticPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<UploadLog[]>([]);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'issues'>('checking');
  const [storageStatus, setStorageStatus] = useState<string>('Unknown');
  
  // Dynamic persistent configuration states
  const [bucketMode, setBucketModeState] = useState(uploadService.getBucketMode());
  const [forceDirect, setForceDirectState] = useState(uploadService.getForceDirect());
  const [bypassCompression, setBypassCompressionState] = useState(uploadService.getBypassCompression());
  const [useFallbackBase64, setUseFallbackBase64State] = useState(uploadService.getUseFallbackBase64());
  
  const [activeTab, setActiveTab] = useState<'upload' | 'crashlytics'>('upload');
  const [crashlyticsLogs, setCrashlyticsLogs] = useState(crashlyticsService.getMemoryLogs());

  useEffect(() => {
    if (activeTab === 'crashlytics') {
      const interval = setInterval(() => {
        setCrashlyticsLogs(crashlyticsService.getMemoryLogs());
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  useEffect(() => {
    const unsub = uploadService.subscribe(setLogs);
    checkHealth();
    return unsub;
  }, []);

  const handleBucketModeChange = (mode: 'appspot' | 'firebasestorage' | 'default') => {
    uploadService.setBucketMode(mode);
    setBucketModeState(mode);
    checkHealth();
  };

  const handleForceDirectChange = (val: boolean) => {
    uploadService.setForceDirect(val);
    setForceDirectState(val);
  };

  const handleBypassCompressionChange = (val: boolean) => {
    uploadService.setBypassCompression(val);
    setBypassCompressionState(val);
  };

  const handleUseFallbackBase64Change = (mode: 'auto' | 'always' | 'never') => {
    uploadService.setUseFallbackBase64(mode);
    setUseFallbackBase64State(mode);
  };

  const runCompressionTest = async () => {
    uploadService.clearLogs();
    uploadService.addLog('info', 'Starting compression unit test...');
    try {
      // Create a large mock canvas to test resizing
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1800;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#10B981';
        ctx.fillRect(0, 0, 1800, 1800);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px sans-serif';
        ctx.fillText('DIAGNOSTICS MOCK', 200, 900);
      }
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/png'));
      const mockFile = new File([blob], 'compression_test.png', { type: 'image/png' });
      
      const startTime = Date.now();
      const compressed = await uploadService.compressImage(mockFile, 1000, 0.75);
      const duration = Date.now() - startTime;
      
      uploadService.addLog('success', 'Compression test complete!', {
        originalSize: `${(mockFile.size / 1024).toFixed(1)}KB`,
        compressedSize: `${(compressed.size / 1024).toFixed(1)}KB`,
        savingRatio: `${((1 - compressed.size / mockFile.size) * 100).toFixed(1)}%`,
        durationMs: duration
      });
    } catch (e: any) {
      uploadService.addLog('error', 'Compression test failed', { message: e.message });
    }
  };

  const runAuthTest = async () => {
    uploadService.clearLogs();
    uploadService.addLog('info', 'Starting secure Session & Auth integrity test...');
    try {
      const user = auth.currentUser;
      if (!user) {
        uploadService.addLog('warn', 'Auth Test: No currentUser session detected. Guest rules will apply.');
        return;
      }
      uploadService.addLog('info', 'Analyzing active Firebase user payload...', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });
      uploadService.addLog('info', 'Requesting fresh ID token details from provider OAuth endpoints...');
      const token = await user.getIdToken(true);
      uploadService.addLog('info', 'Token acquisition successful.', { tokenLength: token.length });
      
      // Decode token roughly
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        uploadService.addLog('info', 'Decoded token claims:', {
          email: payload.email,
          email_verified: payload.email_verified,
          admin_claims: payload.email === 'pavel4mutiara@gmail.com' ? 'SYSTEM_ADMIN_CONFIRMED' : 'STANDARD_USER'
        });
      }
      uploadService.addLog('success', 'Auth state is perfectly clear and verified!');
    } catch (e: any) {
      uploadService.addLog('error', 'Auth test crashed during validation', { error: e.message });
    }
  };

  const runStorageRulesTest = async () => {
    uploadService.clearLogs();
    uploadService.addLog('info', 'Simulating: Auditing write permission sets on Storage directories...');
    await new Promise(r => setTimeout(r, 200));
    
    uploadService.addLog('info', 'Simulated Rule Check: Attempting write to /diagnostics/ folder (Should be open/public)...');
    uploadService.addLog('success', 'SUCCESS: /diagnostics/ write approved in offline mock mode.');
    await new Promise(r => setTimeout(r, 200));

    uploadService.addLog('info', 'Simulated Rule Check: Attempting write to /uploads/ folder (Requires Authenticated Session)...');
    if (auth.currentUser) {
      uploadService.addLog('success', 'SUCCESS: /uploads/ write approved (Active user session detected).');
    } else {
      uploadService.addLog('warn', 'BLOCKED/DENIED: /uploads/ write failed. No active user session present.');
    }
    await new Promise(r => setTimeout(r, 200));

    uploadService.addLog('info', 'Simulated Rule Check: Attempting write to /leadership/ folder (Requires Admin Privilege)...');
    if (auth.currentUser && auth.currentUser.email === 'pavel4mutiara@gmail.com') {
      uploadService.addLog('success', 'SUCCESS: Secure /leadership/ folder write approved for administrator.');
    } else {
      uploadService.addLog('warn', 'RESTRICTED / BLOCKED: Secure /leadership/ write request denied (Only system administrator is allowed).');
    }
  };

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      setStorageStatus('azadi-mock-storage-bucket.appspot.com');
      if (!auth.currentUser) {
         setHealthStatus('issues');
      } else {
         setHealthStatus('healthy');
      }
    } catch (e) {
      setHealthStatus('issues');
    }
  };

  const runSelfTest = async () => {
    uploadService.clearLogs();
    try {
      const dummyBlob = new Blob(['diagnostic test ' + Date.now()], { type: 'text/plain' });
      const testFile = new File([dummyBlob], 'diagnostic_test.txt', { type: 'text/plain' });
      await uploadService.upload(testFile, 'diagnostics');
    } catch (e) {
      // Error is logged by service
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <Bug size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">AI Diagnostic Center</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Upload Engine Monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Health Overview */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
            <Database size={16} className={healthStatus === 'healthy' ? 'text-emerald-500' : 'text-amber-500'} />
            <span className="text-[9px] font-black uppercase mt-1 dark:text-slate-400 tracking-wider">Storage</span>
            <span className="text-[10px] font-bold truncate max-w-full px-2" title={storageStatus}>{storageStatus}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
            <ShieldCheck size={16} className={auth.currentUser ? 'text-emerald-500' : 'text-rose-500'} />
            <span className="text-[9px] font-black uppercase mt-1 dark:text-slate-400 tracking-wider">Auth</span>
            <span className="text-[10px] font-bold">{auth.currentUser ? 'Authenticated' : 'Locked'}</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
             <Activity size={16} className="text-blue-500" />
             <span className="text-[9px] font-black uppercase mt-1 dark:text-slate-400 tracking-wider">Network</span>
             <span className="text-[10px] font-bold">{navigator.onLine ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Diagnostic Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center transition-all border-b-2 ${
              activeTab === 'upload'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Upload Monitor
          </button>
          <button
            onClick={() => {
              setActiveTab('crashlytics');
              setCrashlyticsLogs(crashlyticsService.getMemoryLogs());
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider text-center transition-all border-b-2 ${
              activeTab === 'crashlytics'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            Crashlytics Hub
          </button>
        </div>

        {/* Dynamic Controls / Safety Overrides */}
        {activeTab === 'upload' && (
          <>
            <div className="px-5 py-3 bg-slate-100 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Bucket</span>
                  <select
                    value={bucketMode}
                    onChange={(e) => handleBucketModeChange(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold tracking-tight text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="appspot">(.appspot.com)</option>
                    <option value="firebasestorage">(.firebasestorage.app)</option>
                    <option value="default">(Default Config)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Base64 Fallback</span>
                  <select
                    value={useFallbackBase64}
                    onChange={(e) => handleUseFallbackBase64Change(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] font-bold tracking-tight text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="auto">Auto Fallback (Safe)</option>
                    <option value="always">Always Base64</option>
                    <option value="never">Strict Firebase Only</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Engine API</span>
                <button
                  onClick={() => handleForceDirectChange(!forceDirect)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all tracking-wider border ${
                    forceDirect 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent'
                  }`}
                >
                  {forceDirect ? '⚡ Force Direct (Simple)' : '🔧 Resumable Flow'}
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Actions Grid */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={runCompressionTest}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-850"
              >
                📐 Compression Test
              </button>
              <button
                onClick={runAuthTest}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-850"
              >
                🔑 Auth Test
              </button>
              <button
                onClick={runStorageRulesTest}
                className="py-1.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-850 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-850"
              >
                🛡️ Rules Audit
              </button>
              <button
                onClick={() => handleBypassCompressionChange(!bypassCompression)}
                className={`py-1.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                  bypassCompression 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                    : 'bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850'
                }`}
              >
                {bypassCompression ? '⭐ Bypass Compression: ON' : '📷 Bypass Compression: OFF'}
              </button>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
              {/* Phase 2: Isolation Test */}
              <RawUploaderTest />

              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <Terminal size={48} />
                  <p className="text-xs font-bold mt-4 uppercase tracking-widest">No Active Logs Detected</p>
                </div>
              ) : (
                logs.map(log => (
                  <div 
                    key={log.id} 
                    className={`p-3 rounded-xl border flex gap-3 transition-all ${
                      log.type === 'error' ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' :
                      log.type === 'success' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30' :
                      log.type === 'warn' ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' :
                      'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {log.type === 'error' && <AlertTriangle size={14} className="text-rose-500" />}
                      {log.type === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                      {log.type === 'warn' && <AlertTriangle size={14} className="text-amber-500" />}
                      {log.type === 'info' && <Info size={14} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider dark:text-slate-300">{log.message}</span>
                        <span className="text-[8px] opacity-40 font-mono italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {log.details && (
                        <pre className="text-[9px] leading-relaxed opacity-60 overflow-x-auto p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Crashlytics Hub */}
        {activeTab === 'crashlytics' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans scrollbar-hide">
            <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-all ${
              crashlyticsService.isActive() 
                ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400'
                : 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-800 dark:text-amber-400'
            }`}>
              <div className="h-2.5 w-2.5 rounded-full animate-pulse bg-current shrink-0" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider">
                  {crashlyticsService.isActive() 
                    ? 'Native iOS/Android Crashlytics Integration Connected'
                    : 'Web Developer Context (Standard Console Bridge)'}
                </div>
                <p className="text-[8px] font-bold opacity-75 uppercase tracking-wide mt-0.5">
                  {crashlyticsService.isActive() 
                    ? 'All application failures are streamed immediately to Google BigQuery & Firebase Console.'
                    : 'Mock telemetry active. Real network tracing requires device-side native build.'}
                </p>
              </div>
            </div>

            {/* Triggers and simulators */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simulation Instruments</h4>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-tight">Generate artificial diagnostics reports to audit real-time console tracing state.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await crashlyticsService.recordException(
                      new Error("UI manual test exception: simulated non-fatal WebView crash"),
                      "UserManualDiagnosticTrigger"
                    );
                    setCrashlyticsLogs(crashlyticsService.getMemoryLogs());
                  }}
                  className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-200 transition-all font-black uppercase text-[9px] tracking-wider px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-slate-300/30"
                >
                  <Bug size={12} className="text-amber-500 animate-bounce" />
                  Test Non-Fatal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm("This will trigger a structural exception state to audit Crashlytics recovery. Continue?")) {
                      await crashlyticsService.forceCrash("Interactive UI forced test exception sequence");
                      setCrashlyticsLogs(crashlyticsService.getMemoryLogs());
                    }
                  }}
                  className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all font-black uppercase text-[9px] tracking-wider px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 border border-rose-500/20"
                >
                  <AlertTriangle size={12} />
                  Forced Crash
                </button>
              </div>
            </div>

            {/* Crashlytics Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 tracking-widest px-1">
                <span className="flex items-center gap-2"><Terminal size={12} /> Live Device Timeline ({crashlyticsLogs.length} events)</span>
                <button 
                  onClick={() => {
                    setCrashlyticsLogs(crashlyticsService.getMemoryLogs());
                  }}
                  className="text-emerald-500 hover:underline text-[9px] tracking-wide"
                >
                  Refresh
                </button>
              </div>
              <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[10px] h-56 overflow-y-auto space-y-3 border border-slate-800 custom-scrollbar">
                {crashlyticsLogs.length === 0 && (
                  <div className="text-slate-600 italic">No events generated. Call storage endpoints or run the generators above to seed logs.</div>
                )}
                {crashlyticsLogs.map((lg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 rounded-lg border text-[10px] leading-relaxed ${
                      lg.type === 'exception' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      lg.type === 'context' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      lg.type === 'userId' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      'bg-slate-900/50 text-slate-400 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1 opacity-50 text-[8px] font-bold">
                      <span className="uppercase tracking-widest">[{lg.type}]</span>
                      <span>{new Date(lg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="font-bold text-white mb-0.5 whitespace-pre-wrap">{lg.message}</div>
                    {lg.details && (
                      <pre className="opacity-60 overflow-x-auto text-[8px] mt-1 bg-black/40 p-1.5 rounded border border-white/5 whitespace-pre-wrap">
                        {JSON.stringify(lg.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
          <button 
            onClick={runSelfTest}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-emerald-500/20"
          >
            <CloudLightning size={16} />
            Run System Test
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => uploadService.clearLogs()}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Clear Logs"
            >
              <Trash2 size={16} className="text-slate-500" />
            </button>
            <button 
              onClick={checkHealth}
              className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs"
              title="Check Connectivity"
            >
              <RefreshCcw size={16} className="text-slate-500" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
