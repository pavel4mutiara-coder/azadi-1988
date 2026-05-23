/**
 * Decoupled Raw Uploader Test Sandbox
 * Simulates bare-metal Firebase SDK uploads with granular system metrics and terminal printouts.
 * Completely free of the Firebase Storage JS SDK.
 */

import React, { useState, useRef } from 'react';
import { storage, auth } from '../firebase';
import { Loader2, CloudUpload, CheckCircle, RefreshCw, Layers } from 'lucide-react';

export const RawUploaderTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready');
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  
  const [bucketType, setBucketType] = useState<'appspot' | 'firebasestorage'>('appspot');
  const [uploadMethod, setUploadMethod] = useState<'simple' | 'resumable'>('simple');
  const [useAuth, setUseAuth] = useState<boolean>(true);
  
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDiagLog = (msg: string, details?: any) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${msg}${details ? ' ' + JSON.stringify(details) : ''}`;
    console.log('[BARE-METAL-TEST-MOCK]', msg, details || '');
    setLogs(prev => [formatted, ...prev].slice(0, 30));
  };

  const runIsolatedTestWithFile = async (selectedFile?: File) => {
    setLoading(true);
    setStatus('Testing...');
    setLogs([]);
    setUrl(null);

    try {
      let fileToUpload: File;

      if (selectedFile) {
        fileToUpload = selectedFile;
        addDiagLog(`Using selected file: ${fileToUpload.name} (${(fileToUpload.size / 1024).toFixed(1)} KB), format: ${fileToUpload.type}`);
      } else {
        addDiagLog("Generating a tiny JPG test image from Canvas...");
        const canvas = document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
          ctx.fillRect(0, 0, 120, 120);
          ctx.font = "12px sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText("TEST IMAGE", 10, 60);
          ctx.fillText(Date.now().toString().slice(-4), 10, 80);
        }
        
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg', 0.85));
        fileToUpload = new File([blob], `isolated_test_${Date.now()}.jpg`, { type: 'image/jpeg' });
        addDiagLog(`Generated raw test image: ${fileToUpload.size} bytes`);
      }

      // Verify auth if requested
      if (useAuth) {
        if (!auth.currentUser) {
          addDiagLog("Auth check: User is NOT logged in. Trying to proceed in Guest sandbox...");
        } else {
          addDiagLog(`Auth verified: UID=${auth.currentUser.uid}, Email=${auth.currentUser.email}`);
          addDiagLog("Refreshing auth token payload (Simulation)...");
          const token = await auth.currentUser.getIdToken!(true);
          addDiagLog("Auth token refreshed successfully. Signature length:", token.length);
        }
      } else {
        addDiagLog("Bypassing Auth checking entirely.");
      }

      const projId = 'azadi-mock';
      const bucketUrl = bucketType === 'appspot'
        ? `${projId}.appspot.com`
        : `${projId}.firebasestorage.app`;
      const testPath = `diagnostics/test-upload/test_${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      const startTime = Date.now();
      addDiagLog(`[METRIC - START TIME]: ${new Date(startTime).toLocaleString()}`);
      addDiagLog(`[METRIC - FILE METADATA]: name="${fileToUpload.name}", size=${fileToUpload.size} bytes, type="${fileToUpload.type}"`);
      addDiagLog(`[METRIC - AUTH ACTIVE]: id="${auth.currentUser?.uid || 'guest'}", email="${auth.currentUser?.email || 'none'}"`);
      addDiagLog(`[METRIC - STORAGE TARGET]: gs://${bucketUrl}/${testPath}`);
      
      await new Promise(r => setTimeout(r, 400));

      if (uploadMethod === 'simple') {
        addDiagLog("Executing direct 'uploadBytes' (Simple Non-resumable simulated mode)...");
        await new Promise(r => setTimeout(r, 400));
        
        const duration = Date.now() - startTime;
        addDiagLog(`[METRIC - SNAPSHOT STATE]: state=success, duration=${duration}ms`);
        addDiagLog(`[METRIC - BYTES TRANSFERRED]: totalBytes=${fileToUpload.size}, state=success`);
        addDiagLog("Upload completed successfully in sandbox!");
        
        // Convert to base64 so they can see preview
        const reader = new FileReader();
        const base64Promise = new Promise<string>((res) => {
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(fileToUpload);
        });
        const finalUrl = await base64Promise;
        setUrl(finalUrl);
        addDiagLog(`[METRIC - DOWNLOAD URL]: "${finalUrl.substring(0, 30)}... [Base64 Embedded]"`);
        setStatus('Success: MoK Simple');
      } else {
        addDiagLog("Executing 'uploadBytesResumable' (Resumable simulated mode)...");
        
        for (let pct = 10; pct <= 100; pct += 30) {
          await new Promise(r => setTimeout(r, 200));
          addDiagLog(`[METRIC - PROGRESS UPDATE]: progress=${pct}%, bytesTransferred=${Math.floor(fileToUpload.size * (pct / 100))}, totalBytes=${fileToUpload.size}, state=running`);
        }
        
        const duration = Date.now() - startTime;
        addDiagLog(`[METRIC - TOTAL DURATION]: duration=${duration}ms`);
        addDiagLog(`[METRIC - BYTES TRANSFERRED]: totalBytes=${fileToUpload.size}, state=success`);
        addDiagLog("Task completed successfully. Snapshot state: success");
        
        const reader = new FileReader();
        const base64Promise = new Promise<string>((res) => {
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(fileToUpload);
        });
        const finalUrl = await base64Promise;
        setUrl(finalUrl);
        addDiagLog(`[METRIC - DOWNLOAD URL]: "${finalUrl.substring(0, 30)}... [Base64 Embedded]"`);
        setStatus('Success: MoK Resumable');
      }

    } catch (e: any) {
      console.error('Isolated Bare-Metal Simulation Failed:', e);
      addDiagLog(`Isolated Bare-Metal Simulation Error: ${e.message}`);
      setStatus(`FAILED: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      runIsolatedTestWithFile(file);
    }
  };

  return (
    <div className="p-6 bg-slate-950 rounded-[2rem] border border-emerald-500/30 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Bare-Metal Sandbox (Simulated)</h4>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
          status.includes('Success') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
          status.includes('FAILED') ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 
          'bg-slate-800 text-slate-400'
        }`}>
          {status}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div>
          <label className="block text-[9px] font-black uppercase text-slate-500 mb-1 tracking-wider">Storage Target (Mock)</label>
          <div className="flex gap-1">
            <button
              onClick={() => setBucketType('appspot')}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                bucketType === 'appspot' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              .appspot.com
            </button>
            <button
              onClick={() => setBucketType('firebasestorage')}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                bucketType === 'firebasestorage' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              .firebasestorage.app
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-500 mb-1 tracking-wider">Simulated Upload Method</label>
          <div className="flex gap-1">
            <button
              onClick={() => setUploadMethod('simple')}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                uploadMethod === 'simple' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Simple (uploadBytes)
            </button>
            <button
              onClick={() => setUploadMethod('resumable')}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                uploadMethod === 'resumable' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Resumable Progress
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-black uppercase text-slate-500 mb-1 tracking-wider">Auth token validation</label>
          <div className="flex gap-1">
            <button
              onClick={() => setUseAuth(true)}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                useAuth 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              On (Required)
            </button>
            <button
              onClick={() => setUseAuth(false)}
              disabled={loading}
              className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold transition-all ${
                !useAuth 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Bypass Auth
            </button>
          </div>
        </div>
      </div>

      {url && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-500 font-bold" />
            <span className="text-[10px] font-mono truncate flex-1 text-emerald-400">Sandbox Embedded Image URL</span>
          </div>
          <div className="rounded-lg overflow-hidden max-h-48 border border-white/10 bg-slate-900/40 p-1 flex justify-center">
            <img src={url} alt="Isolated test preview" className="max-h-44 rounded-md object-contain" referrerPolicy="no-referrer" />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => runIsolatedTestWithFile()}
          disabled={loading}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <CloudUpload size={14} />}
          Test Generated Image
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-4 py-3 bg-slate-850 hover:bg-slate-800 text-slate-350 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 border border-slate-700"
        >
          <Layers size={14} />
          Choose File
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>

      {logs.length > 0 && (
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 max-h-36 overflow-y-auto font-mono text-[9px] leading-relaxed text-slate-300 space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="border-b border-white/5 pb-1 last:border-0">{log}</div>
          ))}
        </div>
      )}
      
      <p className="text-[9px] text-slate-500 leading-tight">
        * This component plays in simulated sandboxed environments. It emulates exact SDK metrics for seamless development and testing.
      </p>
    </div>
  );
};
