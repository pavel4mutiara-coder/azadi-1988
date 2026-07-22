import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CURRENT_VERSION } from '../utils/version';
import { Lock, Mail, Eye, EyeOff, Loader2, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const AdminLoginForm: React.FC = () => {
  const { lang, login, loginWithGoogle, resetAdminPassword } = useApp();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Password reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setErrorCode('');
    
    if (!username.trim() || !password.trim()) {
      setErrorMsg(lang === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড দুটিই প্রয়োজন!' : 'Both Username and Password are required!');
      return;
    }
    
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    
    if (!result.success) {
      setErrorMsg(result.message || (lang === 'bn' ? 'লগইন ব্যর্থ হয়েছে।' : 'Login failed.'));
      if (result.errorCode) {
        setErrorCode(result.errorCode);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    if (!resetEmail.trim()) {
      setResetStatus({
        success: false,
        message: lang === 'bn' ? 'অনুগ্রহ করে ইমেল ঠিকানা দিন।' : 'Please enter an email address.'
      });
      return;
    }
    setResetLoading(true);
    const res = await resetAdminPassword(resetEmail);
    setResetLoading(false);
    setResetStatus(res);
  };

  return (
    <div className="max-w-md mx-auto p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-emerald-100 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden my-8 sm:my-12 bengali z-10 transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>

      <div className="w-20 h-20 bg-emerald-50 dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-slate-800 shadow-inner rotate-3">
        {isResetMode ? <KeyRound size={36} /> : <Lock size={36} />}
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {isResetMode
            ? (lang === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Password Reset')
            : (lang === 'bn' ? 'প্রশাসক লগইন' : 'Admin Gateway')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs max-w-xs mx-auto leading-relaxed">
          {isResetMode
            ? (lang === 'bn' ? 'আপনার নিবন্ধিত ইমেল দিন। পাসওয়ার্ড রিসেট লিংক ইমেলে পাঠানো হবে।' : 'Enter your registered email to receive a password reset link.')
            : (lang === 'bn' ? 'আজাদী সমাজ কল্যাণ সংঘের পোর্টাল পরিচালনা করতে লগইন করুন।' : 'Access restricted to authorized personnel only. Verify your credentials.')}
        </p>
      </div>

      {isResetMode ? (
        /* PASSWORD RESET FORM */
        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'নিবন্ধিত ইমেল এড্রেস' : 'Registered Email Address'}
            </label>
            <div className="relative">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: azadisocialwelfareorganization@gmail.com' : 'e.g., azadisocialwelfareorganization@gmail.com'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pl-11 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              <Mail className="absolute left-3.5 top-4 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {resetStatus && (
            <div className={`p-4 rounded-xl border text-xs font-bold flex items-start gap-2.5 ${
              resetStatus.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {resetStatus.success ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <span>{resetStatus.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={resetLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {resetLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              lang === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setResetStatus(null);
            }}
            className="w-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <ArrowLeft size={16} />
            {lang === 'bn' ? 'লগইন পেজে ফিরে যান' : 'Back to Login'}
          </button>
        </form>
      ) : (
        /* LOGIN FORM */
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'bn' ? 'ইমেল অথবা ইউজারনেম' : 'Email / Username'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: azadisocialwelfareorganization@gmail.com' : 'e.g., azadisocialwelfareorganization@gmail.com'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(username.includes('@') ? username : '');
                  setIsResetMode(true);
                  setErrorMsg('');
                }}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {lang === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'bn' ? 'পাসওয়ার্ড দিন' : 'Enter password'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold space-y-1">
              <div className="flex items-center gap-1.5">
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
              {errorCode && (
                <div className="text-[10px] font-mono text-rose-500/80 pl-5">
                  Code: {errorCode}
                </div>
              )}
            </div>
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
            className="w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 font-bold py-3.5 rounded-xl focus:ring-2 focus:ring-slate-400 outline-none transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
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
      )}
    </div>
  );
};
