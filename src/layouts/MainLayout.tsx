
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../utils/constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, Heart, MapPin, Phone, Mail, 
  Loader2, Users, Calendar, Facebook, Youtube, MessageCircle, 
  ShieldAlert, DownloadCloud, X, Share, BellRing, ChevronRight,
  PlusSquare, ArrowUp, PieChart, Home, Info, Sparkles
} from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, settings, isLoaded } = useApp();
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

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
      className={`flex flex-col min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`} 
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

      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-emerald-100 dark:border-slate-800 no-print shadow-soft transition-all duration-300">
        <div className="container mx-auto px-4 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 group min-w-0 flex-1 lg:flex-initial">
             <div className="relative group/logo">
                <OrganizationSeal className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14" />
                <div className="absolute -inset-1 bg-emerald-500/20 rounded-full blur opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
             </div>
            <div className="flex flex-col justify-center min-w-0">
               <h1 className="text-[11px] sm:text-[15px] md:text-lg lg:text-xl font-black uppercase leading-tight text-emerald-900 dark:text-white truncate bengali tracking-tighter">
                {lang === 'bn' ? settings?.nameBn : settings?.nameEn}
              </h1>
              <p className="hidden xs:block text-[7px] sm:text-[9px] md:text-[10px] opacity-80 text-emerald-700 dark:text-emerald-500 font-bold mt-0.5 sm:mt-1 uppercase truncate bengali tracking-[0.1em]">
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
              <ShieldAlert size={18} />
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

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-16 pb-32 md:pb-32 lg:pb-20">
        {children}
        
        {/* Simplified Signature */}
        <div className="lg:hidden text-center mt-12 mb-6 no-print opacity-40">
           <span className="text-[9px] font-bold uppercase bengali text-slate-400 dark:text-emerald-400/50">
             {t.devCredit}
           </span>
        </div>
      </main>

      {/* Responsive App-Style Bottom Nav Enhancement */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] no-print px-6 pb-6 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.3)] flex items-center justify-between px-1.5 py-1 relative">
            {NAV_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isDonation = item.label === 'donation';
              const isImpact = item.label === 'impact';

              if (isDonation) {
                return (
                  <Link key={item.path} to={item.path} className="relative flex flex-col items-center flex-1 group -mt-10 mb-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ring-4 ${
                      isActive 
                      ? 'bg-rose-500 ring-rose-500/20 scale-105 shadow-lg shadow-rose-500/40' 
                      : 'bg-rose-500 ring-transparent scale-100 hover:scale-105 active:scale-95 shadow-md shadow-rose-500/20'
                    }`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { 
                        size: 26, 
                        className: "text-white", 
                        fill: isActive ? 'currentColor' : 'none' 
                      })}
                    </div>
                    <span className={`text-[8px] font-black mt-2 transition-all uppercase tracking-tight bengali ${isActive ? 'text-rose-500' : 'text-slate-500'}`}>
                      {t[item.label as keyof typeof t] as string}
                    </span>
                  </Link>
                );
              }

              return (
                <Link key={item.path} to={item.path} className="flex flex-col items-center justify-center flex-1 py-1.5 gap-0.5 transition-all duration-300 group">
                  <div className={`relative p-2.5 rounded-2xl transition-all duration-500 ${
                    isActive 
                    ? (isImpact ? 'bg-blue-500/15 text-blue-600' : 'bg-emerald-500/15 text-emerald-600')
                    : 'text-slate-500/60 dark:text-slate-400/60 group-hover:text-emerald-500/80 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800/50'
                  }`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { 
                      size: 22, 
                      className: `transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`,
                      strokeWidth: isActive ? 2.5 : 2
                    })}
                    
                    {isActive && (
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isImpact ? 'bg-blue-500' : 'bg-emerald-500'} ring-1 ring-white/50 dark:ring-slate-900/50`}></div>
                    )}
                  </div>
                  <span className={`text-[8px] font-bold transition-all uppercase tracking-tight bengali leading-none ${
                    isActive 
                    ? (isImpact ? 'text-blue-600' : 'text-emerald-600') 
                    : 'text-slate-500/70'
                  }`}>
                    {t[item.label as keyof typeof t] as string}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <footer className="hidden lg:block bg-emerald-50/80 dark:bg-slate-950 border-t border-emerald-100 dark:border-slate-800 pt-16 pb-12 no-print">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 pb-16">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-5">
                <OrganizationSeal className="w-16 h-16 xl:w-20 xl:h-20" />
                <div>
                  <h2 className="text-xl xl:text-2xl font-black text-emerald-900 dark:text-white leading-tight bengali">{lang === 'bn' ? settings?.nameBn : settings?.nameEn}</h2>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1.5 uppercase bengali">{lang === 'bn' ? settings?.sloganBn : settings?.sloganEn}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 xl:gap-5">
                {settings?.facebook && (
                  <a href={getSafeUrl(settings.facebook)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl bg-white dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:scale-110 transition-all border border-blue-100 dark:border-blue-800 shadow-sm">
                    <Facebook size={20} className="xl:size-[24px]" />
                  </a>
                )}
                {settings?.youtube && (
                  <a href={getSafeUrl(settings.youtube)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl bg-white dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:scale-110 transition-all border border-red-100 dark:border-red-800 shadow-sm">
                    <Youtube size={20} className="xl:size-[24px]" />
                  </a>
                )}
                {settings?.whatsappChannel && (
                  <a href={getSafeUrl(settings.whatsappChannel)} target="_blank" rel="noopener noreferrer" className="w-10 h-10 xl:w-12 xl:h-12 rounded-2xl bg-white dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-110 transition-all border border-emerald-100 dark:border-emerald-800 shadow-sm">
                    <MessageCircle size={20} className="xl:size-[24px]" />
                  </a>
                )}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6 xl:space-y-8">
              <h3 className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-400 bengali">দ্রুত লিঙ্ক</h3>
              <ul className="space-y-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 text-sm font-bold flex items-center gap-3 bengali">{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 space-y-6 xl:space-y-8">
              <h3 className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-400 bengali">যোগাযোগ</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                  <MapPin size={20} className="text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold leading-relaxed bengali">{lang === 'bn' ? settings?.addressBn : settings?.addressEn}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <Phone size={20} className="text-emerald-600" />
                  <p className="text-sm font-bold">{settings?.phone}</p>
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
