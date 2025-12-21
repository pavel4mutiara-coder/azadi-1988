
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Donation } from './pages/Donation';
import { Leadership } from './pages/Leadership';
import { Events } from './pages/Events';
import { Impact } from './pages/Impact';
import { AdminDashboard } from './admin/AdminDashboard';
import { LetterheadManager } from './admin/LetterheadManager';
import { FinancialsManager } from './admin/FinancialsManager';
import { SettingsManager } from './admin/SettingsManager';
import { EventManager } from './admin/EventManager';
import { LeadershipManager } from './admin/LeadershipManager';
import { TRANSLATIONS } from './constants';
import { Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [pass, setPass] = useState('');
  const { login, lang } = useApp();
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(pass)) {
      alert('Invalid Password!');
    }
  };

  return (
    <div className="max-w-md mx-auto my-20 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <Lock size={32} />
      </div>
      <h1 className="text-2xl font-black">{t.adminLogin}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="password" 
          placeholder={t.password as string}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl outline-none ring-emerald-500 focus:ring-2 font-black tracking-widest"
          value={pass}
          onChange={e => setPass(e.target.value)}
        />
        <button type="submit" className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
          {t.login}
        </button>
      </form>
      <p className="text-xs opacity-50 italic font-medium">Default password: azadi1988</p>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin } = useApp();
  if (!isAdmin) return <AdminLogin />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/donation" element={<Donation />} />
      <Route path="/leadership" element={<Leadership />} />
      <Route path="/events" element={<Events />} />
      <Route path="/impact" element={<Impact />} />
      
      {/* Admin Panel */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/leadership" element={<ProtectedRoute><LeadershipManager /></ProtectedRoute>} />
      <Route path="/admin/letterhead" element={<ProtectedRoute><LetterheadManager /></ProtectedRoute>} />
      <Route path="/admin/donations" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/financials" element={<ProtectedRoute><FinancialsManager /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute><EventManager /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AppProvider>
  );
}
