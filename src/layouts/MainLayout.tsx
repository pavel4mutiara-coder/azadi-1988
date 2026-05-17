
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../utils/constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, Heart, MapPin, Phone, Mail, 
  Loader2, Users, Calendar, Facebook, Youtube, MessageCircle, 
  ShieldAlert, DownloadCloud, X, Share, BellRing, ChevronRight,
  PlusSquare, ArrowUp, PieChart, Home, Info, Sparkles, Lock, LogOut
} from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, settings, isLoaded, logout } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  // PWA logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
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
      setShowIOSInstructions(true);
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
    setShowIOSInstructions(false);
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

  console.log(`Layout: Rendering. isLoaded=${isLoaded}, theme=${theme}, lang=${lang}`);

  if (!isLoaded) {
    console.log("Layout: Showing loading screen");
    return (
      <div id="loading-fallback" className="fixed inset-0 bg-emerald-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-6 h-6 text-emerald-500" fill="currentColor" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-emerald-800 dark:text-emerald-400 font-black text-sm bengali">
            {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] text-slate-400 hover:text-emerald-500 transition-colors uppercase font-bold"
          >
            Retry Connection
          </button>
        </div>
        
        <button 
          id="skip-loading"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('force-app-load'));
          }}
          className="mt-10 px-6 py-2 border border-emerald-500/30 text-emerald-500 rounded-full text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all"
        >
          {lang === 'bn' ? 'সরাসরি প্রবেশ করুন' : 'Skip & Enter App'}
        </button>
      </div>
    );
  }

  console.log("Layout: Showing main UI. Settings present:", !!settings);

  return (
    <div 
      id="app-layout-root"
      className={`flex flex-col min-h-screen transition-all duration-300 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500/30`} 
      lang={lang}
    >
      
      {showInstallBanner && (
      <div className="fixed bottom-20 md:bottom-auto md:top-24 left-4 right-4 z-[200] lg:max-w-md lg:left-auto lg:right-6 duration-500 no-print">
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] border border-emerald-100 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <DownloadCloud size={120} className="text-emerald-500" />
            </div>
            
            {!showIOSInstructions ? (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center p-2.5 shrink-0 border border-emerald-100 dark:border-emerald-800/50 shadow-inner">
                    <img src={LATEST_LOGO} className="w-full h-full object-contain" alt="App Icon" />
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight bengali">অ্যাপ হিসেবে ব্যবহার করুন</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1 bengali leading-tight">দ্রুত ও অফলাইনে ব্যবহারের জন্য আজাদী অ্যাপটি মোবাইলে ইন্সটল করুন।</p>
                  </div>
                </div>
              ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest bengali">
                      <ArrowUp size={16} className="animate-bounce" /> {lang === 'bn' ? 'কিভাবে ইন্সটল করবেন?' : 'How to Install?'}
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">১</div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bengali">সাফারি ব্রাউজারের নিচের <span className="inline-flex items-center text-emerald-600"><Share size={14} className="mx-1" /> শেয়ার</span> বাটনে ক্লিক করুন।</p>
                      </div>
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">২</div>
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bengali">তালিকা থেকে <span className="inline-flex items-center text-emerald-600"><PlusSquare size={14} className="mx-1" /> Add to Home Screen</span> অপশনটি বেছে নিন।</p>
                      </div>
                    </div>
                  </div>
                )}

              {!showIOSInstructions ? (
                <div className="flex gap-2 relative z-10">
                  <button onClick={handleInstallClick} className="flex-1 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-95">
                    {isIOS ? <Share size={14} /> : <DownloadCloud size={14} />} 
                    {isIOS ? 'পদ্ধতি দেখুন' : 'ইন্সটল করুন'}
                  </button>
                  <button onClick={handleDismiss} className="px-5 py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-black text-[11px] uppercase bengali transition-colors">পরে করব</button>
                </div>
              ) : (
                <button onClick={() => setShowIOSInstructions(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-2xl font-black text-[11px] uppercase bengali shadow-xl transition-all hover:opacity-90 active:scale-95">ঠিক আছে</button>
              )}

              <button onClick={handleDismiss} className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
           </div>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-emerald-100/50 dark:border-slate-800/50 no-print shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 group min-w-0 flex-1 lg:flex-initial transition-transform active:scale-[0.98]">
             <div className="relative">
                <OrganizationSeal className="w-9 h-9 sm:w-11 sm:h-11" />
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>
            <div className="flex flex-col justify-center min-w-0">
               <h1 className="text-[12px] sm:text-[14px] md:text-lg lg:text-xl font-black uppercase leading-tight text-slate-900 dark:text-white truncate bengali tracking-tighter">
                {lang === 'bn' ? settings?.nameBn : settings?.nameEn}
              </h1>
              <p className="hidden xs:block text-[7px] sm:text-[8px] md:text-[9px] opacity-70 text-emerald-600 dark:text-emerald-400 font-black mt-0.5 uppercase truncate bengali tracking-[0.15em]">
                {lang === 'bn' ? settings?.sloganBn : settings?.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`text-[11px] xl:text-[12px] font-black transition-all px-4 py-2.5 rounded-xl flex items-center gap-2 uppercase tracking-wide group ${
                    isActive 
                    ? 'text-emerald-700 dark:text-white bg-emerald-50 dark:bg-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-500/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-slate-900 border border-transparent hover:border-emerald-100 dark:hover:border-slate-800'
                  } bengali`}
                >
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-emerald-600 dark:text-emerald-200' : 'text-slate-400 group-hover:text-emerald-500'}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 16 })}
                  </span>
                  {t[item.label as keyof typeof t] as string}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            <Link 
              to="/admin" 
              className={`p-2.5 sm:p-3 rounded-xl transition-all border shadow-sm ${
                isAdmin 
                ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 border-emerald-200 dark:border-emerald-700 shadow-emerald-500/10' 
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:text-emerald-600 hover:border-emerald-200'
              }`}
              title="Admin Panel"
            >
              <Lock size={18} />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>
            <button 
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} 
              className="px-3 md:px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase flex items-center gap-2 bg-white dark:bg-slate-900 hover:border-emerald-500 transition-all shadow-sm"
            >
              <Languages size={14} className="text-emerald-600" /> 
              <span className="hidden sm:inline">{lang === 'bn' ? 'ENGLISH' : 'বাংলা'}</span>
              <span className="sm:hidden">{lang.toUpperCase()}</span>
            </button>
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-900 transition-all border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm"
            >
              {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-16 pb-24 md:pb-32 lg:pb-20">
        {children}
      </main>

      {/* Responsive App-Style Bottom Nav Enhancement - Super Premium Edition */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-[100] no-print pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="relative bg-surface/95 dark:bg-slate-900/98 backdrop-blur-2xl border border-app-border dark:border-slate-800/80 rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-around px-2 py-1.5 overflow-visible group/nav transition-all duration-500 hover:shadow-emerald-500/10">
            {/* Animated Dynamic Accent Backlight */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-rose-500/20 rounded-[2.5rem] blur-2xl opacity-40 transition-opacity"></div>
            
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const isDonation = item.label === 'donation';
              const isImpact = item.label === 'impact';
              const isHome = item.label === 'home';
              const isEvents = item.label === 'events';
              const isAbout = item.label === 'about';

              if (isDonation) {
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="relative flex flex-col items-center group/btn -mt-10 transition-all duration-500"
                  >
                    <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ring-4 ${
                      isActive 
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600 ring-rose-500/30 grow-animation scale-110 shadow-[0_15px_30px_-5px_rgba(244,63,94,0.6)]' 
                      : 'bg-gradient-to-br from-rose-400 to-rose-500 ring-rose-300/10 scale-100 shadow-[0_10px_20px_-5px_rgba(244,63,94,0.3)] hover:scale-110'
                    }`}>
                      <div className="absolute inset-0 bg-white/20 rounded-[1.6rem] opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      <div className="relative z-10 animate-hover">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { 
                          size: 28, 
                          className: "text-white drop-shadow-md", 
                          fill: isActive ? 'currentColor' : 'none',
                          strokeWidth: 2.5
                        })}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black mt-1 transition-all duration-300 uppercase tracking-tight bengali drop-shadow-sm ${
                      isActive ? 'text-rose-500 translate-y-0 opacity-100' : 'text-slate-400 dark:text-slate-300 translate-y-1 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-y-0'
                    }`}>
                      {t[item.label as keyof typeof t] as string}
                    </span>
                  </Link>
                );
              }

              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="relative flex flex-col items-center justify-center flex-1 py-0.5 group/item outline-none transition-transform active:scale-90"
                >
                  <div className={`relative p-2.5 rounded-[1.2rem] transition-all duration-500 ${
                    isActive 
                    ? (isImpact ? 'text-blue-600' : isHome ? 'text-emerald-600' : isEvents ? 'text-amber-500' : 'text-indigo-500')
                    : 'text-slate-400 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white'
                  }`}>
                    {/* Active Background Pill with specialized colors */}
                    {isActive && (
                      <div className={`absolute inset-0 rounded-[1.2rem] animate-in fade-in zoom-in duration-500 shadow-inner ${
                        isImpact ? 'bg-blue-500/10' : isHome ? 'bg-emerald-500/10' : isEvents ? 'bg-amber-500/10' : 'bg-indigo-500/10'
                      }`}></div>
                    )}

                    <div className="relative z-10 transition-transform duration-300 group-hover/item:scale-110">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { 
                        size: isActive ? 24 : 22, 
                        className: "transition-all duration-300",
                        strokeWidth: isActive ? 3 : 2
                      })}
                    </div>
                    
                    {isActive && (
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full animate-pulse blur-[1px] ${
                        isImpact ? 'bg-blue-500' : isHome ? 'bg-emerald-500' : isEvents ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}></div>
                    )}
                  </div>
                  
                  <span className={`text-[8px] font-black transition-all duration-300 uppercase tracking-tight bengali leading-none mt-1 ${
                    isActive 
                    ? (isImpact ? 'text-blue-600 scale-105' : isHome ? 'text-emerald-600 scale-105' : isEvents ? 'text-amber-600 scale-105' : 'text-indigo-600 scale-105') 
                    : 'text-slate-400 opacity-60 group-hover/item:opacity-100'
                  }`}>
                    {t[item.label as keyof typeof t] as string}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <footer className="bg-slate-100 dark:bg-slate-950 py-16 no-print transition-colors duration-500">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center">
          <a 
            href="https://wa.me/8801712782564" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-300 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Developed by Ahmad Hossain Pavel
            </span>
          </a>
        </div>
      </footer>
    </div>
  );
};
