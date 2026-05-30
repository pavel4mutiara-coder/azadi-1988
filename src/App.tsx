
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
const TestimonialManager = lazy(() => import('./pages/admin/TestimonialManager').then(m => ({ default: m.TestimonialManager })));

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
              {lang === 'bn' ? 'ইউজারনেম' : 'Username'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: Azadi' : 'e.g., Azadi'}
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
        </form>

        <div className="relative my-6 flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-450 font-bold text-[10px] uppercase tracking-wider">
            {lang === 'bn' ? 'অথবা' : 'OR'}
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <button 
          type="button"
          onClick={loginWithGoogle}
          className="w-full bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-black py-4 rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800 relative cursor-pointer font-sans text-sm"
        >
          <svg className="w-5 h-5 fill-current text-emerald-600" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887C18.2 16.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.71 0 3.275.61 4.5 1.625l3.09-3.09C17.944 1.139 15.27 0 12.24 0 6.033 0 1 5.033 1 11.24s5.033 11.24 11.24 11.24c5.895 0 10.11-4.14 10.11-10.24 0-.69-.06-1.355-.175-1.955H12.24z"/>
          </svg>
          {lang === 'bn' ? 'Google দিয়ে সাইন-ইন' : 'Sign in with Google'}
        </button>
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
        
        {/* Admin Panel */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/leadership" element={<ProtectedRoute><LeadershipManager /></ProtectedRoute>} />
        <Route path="/admin/letterhead" element={<ProtectedRoute><LetterheadManager /></ProtectedRoute>} />
        <Route path="/admin/donations" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/expenses" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><EventManager /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute><NoticeManager /></ProtectedRoute>} />
        <Route path="/admin/news" element={<ProtectedRoute><NewsManager /></ProtectedRoute>} />
        <Route path="/admin/testimonials" element={<ProtectedRoute><TestimonialManager /></ProtectedRoute>} />
        
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
