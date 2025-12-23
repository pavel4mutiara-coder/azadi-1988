
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, LogOut, Heart, MapPin, Phone, Mail, 
  Loader2, LayoutDashboard, Home, PieChart, Users, Calendar,
  ShieldCheck, Facebook, Youtube, MessageCircle, Lock, ShieldAlert,
  DownloadCloud, X, Share
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, logout, settings, isLoaded } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  // PWA/iOS Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallBanner(true);
      }
    });

    // For iOS, check if it's already in standalone mode
    if (ios && !window.matchMedia('(display-mode: standalone)').matches) {
      setTimeout(() => setShowInstallBanner(true), 3000);
    }
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      alert(lang === 'bn' ? 'অ্যাপটি ইন্সটল করতে Safari ব্রাউজারের নিচে "Share" বাটনে ক্লিক করে "Add to Home Screen" নির্বাচন করুন।' : 'To install, tap the "Share" button in Safari and select "Add to Home Screen".');
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const LATEST_LOGO = "https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh";

  const OrganizationSeal = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`${className} relative rounded-full border-[2px] sm:border-[3px] border-emerald-600 dark:border-emerald-500 bg-white p-1 shadow-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-300 ring-4 ring-emerald-500/10 shrink-0`}>
      <div className="absolute inset-0 border-[2px] sm:border-[4px] border-emerald-50 dark:border-emerald-950/20 rounded-full"></div>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white relative z-10">
        <img src={LATEST_LOGO} alt="Logo" className="w-full h-full object-contain p-0.5" />
      </div>
    </div>
  );

  /**
   * Safe URL formatter to ensure links are absolute
   */
  const getSafeUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http')) return trimmed;
    return `https://${trimmed}`;
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-emerald-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-6 h-6 text-emerald-500 animate-pulse" fill="currentColor" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} bg-emerald-50/40 dark:bg-slate-950 text-slate-900 dark:text-slate-100`} lang={lang}>
      {/* Smart Install Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] bg-slate-900 text-white p-5 rounded-[2.5rem] shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-10 lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shrink-0">
               <img src={LATEST_LOGO} className="w-full h-full object-contain" alt="App" />
            </div>
            <div>
              <p className="font-black text-sm bengali">অ্যাপটি আপনার মোবাইলে রাখুন</p>
              <p className="text-[10px] opacity-70 font-bold bengali">দ্রুত ও অফলাইন ব্যবহারের জন্য</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleInstallClick} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all">
              {isIOS ? <Share size={16} /> : <DownloadCloud size={16} />} {isIOS ? 'কিভাবে?' : 'ইন্সটল'}
            </button>
            <button onClick={() => setShowInstallBanner(false)} className="p-2 text-white/40 hover:text-white"><X size={20} /></button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-800 no-print">
        <div className="container mx-auto px-4 h-18 sm:h-22 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 group min-w-0 flex-1 lg:flex-initial">
            <OrganizationSeal className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-[12px] sm:text-lg lg:text-xl font-black uppercase tracking-tight leading-none text-emerald-900 dark:text-white truncate bengali">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>
              <p className="text-[8px] sm:text-[10px] opacity-80 text-emerald-700 dark:text-emerald-500 font-black mt-1.5 tracking-wider uppercase truncate bengali">
                {lang === 'bn' ? settings.sloganBn : settings.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => (
              <Link key={item.path} to={item.path} className={`text-[13px] font-black transition-all px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-wide ${location.pathname === item.path ? 'text-emerald-700 dark:text-white bg-emerald-100 dark:bg-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-900'} bengali`}>
                {item.icon} {t[item.label as keyof typeof t] as string}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link to="/admin" className={`p-2.5 sm:p-3 rounded-xl transition-all border ${isAdmin ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100' : 'bg-emerald-50/50 dark:bg-slate-900 text-slate-500 border-emerald-100 hover:text-emerald-600'}`}>
              <ShieldAlert size={18} />
            </Link>
            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="p-2 sm:p-3 rounded-xl border border-emerald-100 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase flex items-center gap-1.5 bg-white/50 dark:bg-transparent">
              <Languages size={18} className="text-emerald-600" /> {lang.toUpperCase()}
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-slate-900 transition-all border border-emerald-100 dark:border-slate-800">
              {theme === 'light' ? <Moon size={18} className="text-emerald-600" /> : <Sun size={18} className="text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-20 pb-40 lg:pb-20">
        {children}
      </main>

      {/* App-like Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-emerald-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between z-[90] shadow-2xl no-print">
        {NAV_ITEMS.map((item) => (
          <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-1.5 ${location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400'}`}>
            <div className={`p-2 rounded-2xl transition-all ${location.pathname === item.path ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : ''}`}>
              {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bengali">{t[item.label as keyof typeof t] as string}</span>
          </Link>
        ))}
      </nav>

      <footer className="hidden lg:block bg-emerald-50/80 dark:bg-slate-950 border-t border-emerald-100 dark:border-slate-800 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 pb-16">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-5">
                <OrganizationSeal className="w-20 h-20" />
                <div>
                  <h2 className="text-2xl font-black text-emerald-900 dark:text-white leading-tight bengali">{lang === 'bn' ? settings.nameBn : settings.nameEn}</h2>
                  <p className="text-[10px] font-black text-emerald-600 mt-1.5 uppercase tracking-widest bengali">{lang === 'bn' ? settings.sloganBn : settings.sloganEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                {settings.facebook && (
                  <a href={getSafeUrl(settings.facebook)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:scale-110 transition-all border border-blue-100 dark:border-blue-800 shadow-sm">
                    <Facebook size={24} />
                  </a>
                )}
                {settings.youtube && (
                  <a href={getSafeUrl(settings.youtube)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:scale-110 transition-all border border-red-100 dark:border-red-800 shadow-sm">
                    <Youtube size={24} />
                  </a>
                )}
                {settings.whatsappChannel && (
                  <a href={getSafeUrl(settings.whatsappChannel)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-white dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-110 transition-all border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <MessageCircle size={24} />
                  </a>
                )}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 bengali">দ্রুত লিঙ্ক</h3>
              <ul className="space-y-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 text-sm font-black flex items-center gap-3 bengali">{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400 bengali">যোগাযোগ</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                  <MapPin size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-sm font-black leading-relaxed bengali">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <Phone size={20} className="text-emerald-600" />
                  <p className="text-sm font-black">{settings.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-emerald-100 dark:border-slate-800 flex justify-between items-center">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} Azadi Social Welfare.</div>
            <span className="text-[10px] font-black text-white bg-emerald-600 px-4 py-1.5 rounded-full">Architect: Ahmed Hossain Pavel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
