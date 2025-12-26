
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, Heart, MapPin, Phone, Mail, 
  Loader2, Users, Calendar, Facebook, Youtube, MessageCircle, 
  ShieldAlert, DownloadCloud, X, Share, BellRing
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, settings, isLoaded } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  // PWA logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandalone && !isDismissed) {
        setTimeout(() => setShowInstallBanner(true), 2000);
      }
    });

    if (ios && !isStandalone && !isDismissed) {
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

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
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
      
      {showInstallBanner && (
        <div className="fixed top-24 left-4 right-4 z-[200] lg:max-w-md lg:left-auto lg:right-6 animate-in slide-in-from-top-10 duration-500 no-print">
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-emerald-100 dark:border-slate-800 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <BellRing size={40} className="text-emerald-500" />
              </div>
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center p-2.5 shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                 <img src={LATEST_LOGO} className="w-full h-full object-contain" alt="App Icon" />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight bengali">ইন্সটল করে মোবাইলে রাখুন</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1 bengali leading-tight">দ্রুত ও অফলাইন ব্যবহারের জন্য এটি সেরা মাধ্যম।</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={handleInstallClick} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
                    {isIOS ? <Share size={12} /> : <DownloadCloud size={12} />} {isIOS ? 'কিভাবে?' : 'ইন্সটল করুন'}
                  </button>
                  <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black text-[10px] uppercase px-2 py-2 bengali">পরে করব</button>
                </div>
              </div>
              <button onClick={handleDismiss} className="absolute top-4 right-4 p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={16} />
              </button>
           </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-800 no-print">
        <div className="container mx-auto px-4 h-18 sm:h-22 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 group min-w-0 flex-1 lg:flex-initial">
            <OrganizationSeal className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-[14px] sm:text-lg lg:text-xl font-black uppercase leading-none text-emerald-900 dark:text-white truncate bengali">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>
              <p className="text-[9px] sm:text-[10px] opacity-80 text-emerald-700 dark:text-emerald-500 font-black mt-1.5 uppercase truncate bengali">
                {lang === 'bn' ? settings.sloganBn : settings.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => (
              <Link key={item.path} to={item.path} className={`text-[13px] font-black transition-all px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-tight ${location.pathname === item.path ? 'text-emerald-700 dark:text-white bg-emerald-100 dark:bg-emerald-600' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-900'} bengali`}>
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
        
        {/* Simplified Signature - Removed tracking classes */}
        <div className="lg:hidden text-center mt-12 mb-6 no-print opacity-50">
           <span className="text-[10px] font-bold uppercase bengali text-slate-500 dark:text-emerald-400/70">
             {t.devCredit}
           </span>
        </div>
      </main>

      {/* App Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] no-print">
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-emerald-100 dark:border-slate-800"></div>
        <div className="relative container mx-auto px-6 py-3 pb-6 flex items-end justify-between">
          {NAV_ITEMS.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isCenter = index === 2;

            if (isCenter) {
              return (
                <Link key={item.path} to={item.path} className="relative -top-8 flex flex-col items-center group">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isActive ? 'bg-emerald-600 scale-110' : 'bg-emerald-600 scale-100 hover:scale-105'}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28, className: "text-white relative z-10", fill: isActive ? 'currentColor' : 'none' })}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 transition-colors bengali ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {t[item.label as keyof typeof t] as string}
                  </span>
                </Link>
              );
            }

            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1 group transition-all">
                <div className={`relative p-2 rounded-2xl transition-all duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24, fill: isActive ? 'currentColor' : 'none' })}
                </div>
                <span className={`text-[10px] font-bold transition-colors bengali ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {t[item.label as keyof typeof t] as string}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="hidden lg:block bg-emerald-50/80 dark:bg-slate-950 border-t border-emerald-100 dark:border-slate-800 pt-16 pb-12 no-print">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 pb-16">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-5">
                <OrganizationSeal className="w-20 h-20" />
                <div>
                  <h2 className="text-2xl font-black text-emerald-900 dark:text-white leading-tight bengali">{lang === 'bn' ? settings.nameBn : settings.nameEn}</h2>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1.5 uppercase bengali">{lang === 'bn' ? settings.sloganBn : settings.sloganEn}</p>
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
              <h3 className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-400 bengali">দ্রুত লিঙ্ক</h3>
              <ul className="space-y-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 text-sm font-bold flex items-center gap-3 bengali">{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <h3 className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-400 bengali">যোগাযোগ</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                  <MapPin size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold leading-relaxed bengali">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <Phone size={20} className="text-emerald-600" />
                  <p className="text-sm font-bold">{settings.phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-emerald-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">© {new Date().getFullYear()} Azadi Social Welfare. All Rights Reserved.</div>
            <div className="text-[11px] font-bold bengali opacity-50 text-slate-500 dark:text-emerald-400/60">
               {t.devCredit}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
