
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout as Layout } from './layouts/MainLayout';
import Home from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UpdateManager } from './components/UpdateManager';
import { CURRENT_VERSION } from './utils/version';
import { TRANSLATIONS } from './utils/constants';
import { Lock, Loader2 } from 'lucide-react';
const lazyWithRetry = (componentImport: () => Promise<any>) => {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn("Failed to dynamically import module, retrying in 1.5 seconds...", error);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return await componentImport();
      } catch (retryError) {
        console.error("Second attempt failed. Forcing page refresh to upgrade dynamic bundles.", retryError);
        const reloadCountKey = 'chunk_reload_count';
        const reloadCount = parseInt(sessionStorage.getItem(reloadCountKey) || '0', 10);
        if (reloadCount < 2) {
          sessionStorage.setItem(reloadCountKey, String(reloadCount + 1));
          window.location.reload();
          return new Promise(() => {});
        }
        throw retryError;
      }
    }
  });
};

const AboutUs = lazyWithRetry(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const Events = lazyWithRetry(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Leadership = lazyWithRetry(() => import('./pages/Leadership').then(m => ({ default: m.Leadership })));
const Donation = lazyWithRetry(() => import('./pages/Donation').then(m => ({ default: m.Donation })));
const DonationHistory = lazyWithRetry(() => import('./pages/DonationHistory').then(m => ({ default: m.DonationHistory })));
const Impact = lazyWithRetry(() => import('./pages/Impact').then(m => ({ default: m.Impact })));
const Notices = lazyWithRetry(() => import('./pages/Notices').then(m => ({ default: m.Notices })));
const NewsPage = lazyWithRetry(() => import('./pages/News').then(m => ({ default: m.NewsPage })));

// Admin Pages
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LetterheadManager = lazyWithRetry(() => import('./pages/admin/LetterheadManager').then(m => ({ default: m.LetterheadManager })));
const SettingsManager = lazyWithRetry(() => import('./pages/admin/SettingsManager').then(m => ({ default: m.SettingsManager })));
const EventManager = lazyWithRetry(() => import('./pages/admin/EventManager').then(m => ({ default: m.EventManager })));
const LeadershipManager = lazyWithRetry(() => import('./pages/admin/LeadershipManager').then(m => ({ default: m.LeadershipManager })));
const NoticeManager = lazyWithRetry(() => import('./pages/admin/NoticeManager').then(m => ({ default: m.NoticeManager })));
const NewsManager = lazyWithRetry(() => import('./pages/admin/NewsManager').then(m => ({ default: m.NewsManager })));
const TestimonialManager = lazyWithRetry(() => import('./pages/admin/TestimonialManager').then(m => ({ default: m.TestimonialManager })));
const ReportsManager = lazyWithRetry(() => import('./pages/admin/ReportsManager').then(m => ({ default: m.ReportsManager })));
const SystemAdmin = lazyWithRetry(() => import('./pages/admin/SystemAdmin').then(m => ({ default: m.SystemAdmin })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <Loader2 className="animate-spin text-emerald-600" size={48} />
    <p className="text-slate-500 font-medium">Loading...</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, authLoading, login, loginWithGoogle, lang } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const superAdminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'pavel4mutiara@gmail.com';

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">
          {lang === 'bn' ? 'অপেক্ষা করুন...' : 'Authenticating admin...'}
        </p>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg(lang === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড দুটিই প্রয়োজন!' : 'Both Username and Password are required!');
      return;
    }
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (!success) {
      setErrorMsg(lang === 'bn' ? 'ভুল ইউজারনেম অথবা পাসওয়ার্ড!' : 'Incorrect username or password!');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden my-12 bengali z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full"></div>
        <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-slate-800 shadow-inner rotate-3">
          <Lock size={36} />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'প্রশাসক লগইন' : 'Admin Gateway'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs max-w-xs mx-auto leading-relaxed">
            {lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘের পোর্টাল পরিচালনা করতে লগইন করুন।' : 'Access restricted to authorized personnel only. Please verify your credentials.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'ইমেল অথবা ইউজারনেম' : 'Email / Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: admin@azadi.org' : 'e.g., admin@azadi.org'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === 'bn' ? 'পাসওয়ার্ড দিন' : 'Enter password'}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-black text-red-500 text-center">
              ⚠️ {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              lang === 'bn' ? 'লগইন করুন' : 'Login'
            )}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute inset-x-0 h-px bg-slate-100 dark:bg-slate-800"></span>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 capitalize">
              {lang === 'bn' ? 'অথবা' : 'or'}
            </span>
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-bold py-4 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
            </svg>
            {lang === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google'}
          </button>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
              {lang === 'bn' ? 'সফটওয়্যার সংস্করণ' : 'Application Version'}
            </span>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-black text-[10px]">
                {CURRENT_VERSION.latestVersion}
              </span>
              <span>•</span>
              <span>Build #{CURRENT_VERSION.buildNumber}</span>
              <span>•</span>
              <span>{CURRENT_VERSION.releaseDate}</span>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/donation-history" element={<DonationHistory />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/news" element={<NewsPage />} />
        
        {/* Admin Panel */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/leadership" element={<ProtectedRoute><LeadershipManager /></ProtectedRoute>} />
        <Route path="/admin/letterhead" element={<ProtectedRoute><LetterheadManager /></ProtectedRoute>} />
        <Route path="/admin/donations" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/expenses" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />
        <Route path="/admin/system" element={<ProtectedRoute><SystemAdmin /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventManager /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute><NoticeManager /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute><NewsManager /></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialManager /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute><ReportsManager /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

console.log("App component module loading...");

export default function App() {
  console.log("App component: Starting render pass");
  React.useEffect(() => {
    sessionStorage.removeItem('chunk_reload_count');
    sessionStorage.removeItem('chunk_error_reload_count');
  }, []);
  try {
    return (
      <ErrorBoundary>
        <AppProvider>
          <UpdateManager />
          <Router>
            <Layout>
              <AppRoutes />
            </Layout>
          </Router>
        </AppProvider>
      </ErrorBoundary>
    );
  } catch (e) {
    console.error("App: Fatal Render Error", e);
    return (
      <div style={{ background: '#020617', color: '#ef4444', padding: '50px', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontWeight: 900 }}>CRITICAL APP ERROR</h1>
        <pre style={{ background: 'rgba(239, 64, 64, 0.1)', padding: '20px', borderRadius: '12px', marginTop: '20px', maxWidth: '80%', overflow: 'auto' }}>{String(e)}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Reload</button>
      </div>
    );
  }
}
