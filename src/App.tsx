
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
  const { isAdmin, authLoading, loginWithGoogle, lang } = useApp();

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

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden my-12 bengali z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full"></div>
        <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-slate-800 shadow-inner rotate-3">
          <Lock size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {lang === 'bn' ? 'প্রশাসক লগইন' : 'Admin Gateway'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs max-w-xs mx-auto leading-relaxed">
            {lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘের পোর্টাল পরিচালনা করতে লগইন করুন।' : 'Access restricted to authorized personnel only. Please verify your credentials.'}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-5 rounded-2xl text-left space-y-1.5 animate-pulse">
          <h4 className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Lock size={14} /> {lang === 'bn' ? 'ইউজার গাইড' : 'Database Rules'}
          </h4>
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
            {lang === 'bn' ? (
              <>
                প্রবেশাধিকার পেতে আপনার অনুমোদিত মেইল <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded text-amber-900 font-black">{superAdminEmail}</code> দিয়ে সাইন-ইন সম্পন্ন করুন।
              </>
            ) : (
              <>
                Sign in with authorized developer email <code className="font-mono bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded text-amber-900 font-black">{superAdminEmail}</code> to grant administrative Firestore rules.
              </>
            )}
          </p>
        </div>

        <button 
          onClick={loginWithGoogle}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 relative cursor-pointer font-sans"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
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
