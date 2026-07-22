
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout as Layout } from './layouts/MainLayout';
import Home from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UpdateManager } from './components/UpdateManager';
import { AdminLoginForm } from './components/AdminLoginForm';
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
const Gallery = lazyWithRetry(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Transparency = lazyWithRetry(() => import('./pages/Transparency').then(m => ({ default: m.Transparency })));
const Contact = lazyWithRetry(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const VerifyReceipt = lazyWithRetry(() => import('./pages/VerifyReceipt').then(m => ({ default: m.VerifyReceipt })));

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
const AuditLogViewer = lazyWithRetry(() => import('./pages/admin/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const SystemAdmin = lazyWithRetry(() => import('./pages/admin/SystemAdmin').then(m => ({ default: m.SystemAdmin })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <Loader2 className="animate-spin text-emerald-600" size={48} />
    <p className="text-slate-500 font-medium">Loading...</p>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, authLoading, lang } = useApp();

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
    return <AdminLoginForm />;
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
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/verify-donation" element={<VerifyReceipt />} />
        <Route path="/verify-donation/:receiptId" element={<VerifyReceipt />} />
        
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
        <Route path="/admin/audit" element={<ProtectedRoute><AuditLogViewer /></ProtectedRoute>} />
        
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
