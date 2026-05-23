
import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout as Layout } from './layouts/MainLayout';
import Home from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TRANSLATIONS } from './utils/constants';
import { Lock, Loader2 } from 'lucide-react';
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
const Events = lazy(() => import('./pages/Events').then(m => ({ default: m.Events })));
const Leadership = lazy(() => import('./pages/Leadership').then(m => ({ default: m.Leadership })));
const Donation = lazy(() => import('./pages/Donation').then(m => ({ default: m.Donation })));
const DonationHistory = lazy(() => import('./pages/DonationHistory').then(m => ({ default: m.DonationHistory })));
const Impact = lazy(() => import('./pages/Impact').then(m => ({ default: m.Impact })));
const Notices = lazy(() => import('./pages/Notices').then(m => ({ default: m.Notices })));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const LetterheadManager = lazy(() => import('./pages/admin/LetterheadManager').then(m => ({ default: m.LetterheadManager })));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager').then(m => ({ default: m.SettingsManager })));
const EventManager = lazy(() => import('./pages/admin/EventManager').then(m => ({ default: m.EventManager })));
const LeadershipManager = lazy(() => import('./pages/admin/LeadershipManager').then(m => ({ default: m.LeadershipManager })));
const NoticeManager = lazy(() => import('./pages/admin/NoticeManager').then(m => ({ default: m.NoticeManager })));
const NewsManager = lazy(() => import('./pages/admin/NewsManager').then(m => ({ default: m.NewsManager })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <Loader2 className="animate-spin text-emerald-600" size={48} />
    <p className="text-slate-500 font-medium">Loading...</p>
  </div>
);

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, loginWithGoogle, lang } = useApp();
  const t = TRANSLATIONS[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      if (!await login(username, pass)) {
        alert(lang === 'bn' ? 'ভুল ইউজারনেম বা পাসওয়ার্ড!' : 'Invalid Username or Password!');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 md:my-20 bg-white dark:bg-slate-900 p-10 rounded-4xl border border-slate-200 dark:border-slate-800 shadow-heavy text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600"></div>
      
      <div className="space-y-4">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-500/5">
          <Lock size={36} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">{t.adminLogin}</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-2">{lang === 'bn' ? 'শুধুমাত্র অনুমোদিত ব্যক্তিদের জন্য' : 'Authorized Personnel Only'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-black py-4 px-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm group active:scale-95 disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 className="animate-spin text-emerald-600" size={20} /> : <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />}
          <span className="text-[12px] uppercase tracking-wide">{lang === 'bn' ? 'গুগল দিয়ে লগইন করুন' : 'Sign in with Google'}</span>
        </button>
        
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 tracking-widest">SECURE PORTAL</span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          {lang === 'bn' ? 'ইউজারনেম' : 'Username'}
        </div>
        <input 
          type="text" 
          placeholder="admin..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-black transition-all"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <div className="space-y-1.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          {t.password as string}
        </div>
        <input 
          type="password" 
          placeholder="••••••••"
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none ring-emerald-500 focus:ring-2 font-black tracking-[0.5em] transition-all"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={isLoggingIn}
          className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-xs uppercase tracking-[0.2em] mt-2 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoggingIn && <Loader2 className="animate-spin" size={18} />}
          {isLoggingIn ? (lang === 'bn' ? 'প্রক্রিয়া হচ্ছে...' : 'Processing...') : t.login}
        </button>
      </form>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  if (!isAdmin) return <AdminLogin />;
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
        
        {/* Admin Panel */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/leadership" element={<ProtectedRoute><LeadershipManager /></ProtectedRoute>} />
        <Route path="/admin/letterhead" element={<ProtectedRoute><LetterheadManager /></ProtectedRoute>} />
        <Route path="/admin/donations" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventManager /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute><NoticeManager /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute><NewsManager /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

console.log("App component module loading...");

export default function App() {
  console.log("App component: Starting render pass");
  try {
    return (
      <ErrorBoundary>
        <AppProvider>
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
