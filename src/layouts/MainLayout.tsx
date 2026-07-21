import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS, MOBILE_NAV_ITEMS } from '../utils/constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, Heart, MapPin, Phone, Mail, 
  Loader2, Users, Calendar, Facebook, Youtube, MessageCircle, 
  DownloadCloud, X, Share, BellRing, ChevronRight,
  PlusSquare, ArrowUp, PieChart, Home, Sparkles, Lock, Menu,
  Award, Shield, ExternalLink, CheckCircle2, Image as ImageIcon
} from 'lucide-react';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    lang, 
    setLang, 
    theme, 
    setTheme, 
    isAdmin, 
    settings, 
    isLoaded
  } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  // Mobile menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // PWA install banner logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

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
  }, [isDismissed]);

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
    setIsDismissed(true);
  };

  const LATEST_LOGO = "https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh";

  const OrganizationSeal = ({ className = "w-11 h-11" }: { className?: string }) => (
    <div className={`${className} relative rounded-full border-[2.5px] border-blue-700 dark:border-blue-500 bg-white p-0.5 shadow-md overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-300 ring-2 ring-amber-500/20 shrink-0`}>
      <div className="absolute inset-0 border border-amber-500/30 rounded-full"></div>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white relative z-10">
        <img src={LATEST_LOGO} alt="Azadi Seal" className="w-full h-full object-contain p-0.5" />
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
      <div id="loading-fallback" className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <Award className="absolute w-6 h-6 text-amber-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white font-black text-lg tracking-wide bengali">
            {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
          </h2>
          <p className="text-blue-300 font-bold text-xs uppercase tracking-widest bengali">
            {lang === 'bn' ? 'তথ্য লোড হচ্ছে...' : 'Loading Organization Data...'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] text-slate-400 hover:text-amber-400 transition-colors uppercase font-bold mt-2"
          >
            Retry Connection
          </button>
        </div>
        
        <button 
          id="skip-loading"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('force-app-load'));
          }}
          className="mt-6 px-6 py-2 border border-blue-500/40 text-blue-300 rounded-full text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white transition-all"
        >
          {lang === 'bn' ? 'সরাসরি প্রবেশ করুন' : 'Skip & Enter App'}
        </button>
      </div>
    );
  }

  return (
    <div 
      id="app-layout-root"
      className={`flex flex-col min-h-screen transition-all duration-300 bg-slate-50 dark:bg-[#0b1329] text-slate-900 dark:text-slate-100 selection:bg-blue-600/30`} 
      lang={lang}
    >
      
      {/* PWA Installation Prompt Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-20 md:bottom-auto md:top-24 left-4 right-4 z-[200] lg:max-w-md lg:left-auto lg:right-6 duration-500 no-print">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-blue-100 dark:border-slate-800 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <DownloadCloud size={120} className="text-blue-600" />
            </div>
            
            {!showIOSInstructions ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <img src={LATEST_LOGO} className="w-full h-full object-contain" alt="App Icon" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight bengali">অ্যাপ হিসেবে ব্যবহার করুন</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 bengali leading-tight">দ্রুত ও অফলাইনে ব্যবহারের জন্য আজাদী অ্যাপটি মোবাইলে ইন্সটল করুন।</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest bengali">
                  <ArrowUp size={16} className="animate-bounce" /> {lang === 'bn' ? 'কিভাবে ইন্সটল করবেন?' : 'How to Install?'}
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs shrink-0">১</div>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bengali">সাফারি ব্রাউজারের নিচের <span className="inline-flex items-center text-blue-600"><Share size={12} className="mx-1" /> শেয়ার</span> বাটনে ক্লিক করুন।</p>
                  </div>
                  <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-black text-xs shrink-0">২</div>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bengali">তালিকা থেকে <span className="inline-flex items-center text-blue-600"><PlusSquare size={12} className="mx-1" /> Add to Home Screen</span> অপশনটি বেছে নিন।</p>
                  </div>
                </div>
              </div>
            )}

            {!showIOSInstructions ? (
              <div className="flex gap-2 relative z-10">
                <button onClick={handleInstallClick} className="flex-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase flex items-center justify-center gap-2 shadow-lg shadow-blue-700/30 hover:brightness-110 transition-all active:scale-95">
                  {isIOS ? <Share size={14} /> : <DownloadCloud size={14} />} 
                  {isIOS ? 'পদ্ধতি দেখুন' : 'ইন্সটল করুন'}
                </button>
                <button onClick={handleDismiss} className="px-4 py-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-[11px] uppercase bengali transition-colors">পরে করব</button>
              </div>
            ) : (
              <button onClick={() => setShowIOSInstructions(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl font-bold text-[11px] uppercase bengali shadow-md transition-all hover:opacity-90 active:scale-95">ঠিক আছে</button>
            )}

            <button onClick={handleDismiss} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* TOP UTILITY HEADER (Institutional Info & Quick Contacts) */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800/80 text-[11px] py-1.5 px-4 hidden sm:block no-print z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Award size={13} className="text-amber-400 shrink-0" />
              <span>{lang === 'bn' ? 'প্রতিষ্ঠিত: ১০ জুন ১৯৮৮ (৩৮ বছরের সেবা)' : 'Est. 10 June 1988 (38 Years of Service)'}</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin size={12} className="text-blue-400 shrink-0" />
              <span>{lang === 'bn' ? 'মিরবক্সটুলা, সিলেট, বাংলাদেশ' : 'Mirbox Tula, Sylhet, Bangladesh'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="tel:+8801712782564" className="flex items-center gap-1 hover:text-amber-400 transition-colors">
              <Phone size={12} className="text-amber-400" />
              <span>+880 1712-782564</span>
            </a>
            <span className="text-slate-700">|</span>
            <a href="https://wa.me/8801712782564" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              <MessageCircle size={12} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* MAIN HEADER & NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 no-print shadow-sm transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group min-w-0 shrink-0 transition-transform active:scale-[0.98]">
            <OrganizationSeal className="w-9 h-9 sm:w-12 sm:h-12" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-12px xs:text-14px sm:text-base md:text-lg lg:text-xl font-black uppercase leading-tight text-slate-900 dark:text-white truncate bengali tracking-tight">
                {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-blue-700 dark:text-amber-400 font-bold uppercase truncate bengali tracking-wider mt-0.5">
                {lang === 'bn' ? settings?.sloganBn || 'শিক্ষা · ঐক্য · সেবা · শান্তি · ক্রীড়া' : settings?.sloganEn || 'Education · Unity · Service · Peace · Sports'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`text-xs font-bold transition-all px-3 xl:px-3.5 py-2 rounded-xl flex items-center gap-1.5 uppercase tracking-wide group ${
                    isActive 
                    ? 'text-white bg-blue-700 shadow-md shadow-blue-700/20' 
                    : 'text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-amber-400 hover:bg-blue-50/60 dark:hover:bg-slate-800/60'
                  } bengali`}
                >
                  <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-amber-300' : 'text-slate-400 dark:text-slate-400 group-hover:text-blue-600'}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 15 })}
                  </span>
                  <span>{t[item.label as keyof typeof t] as string}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Controls & Donate CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Header Donate Button (Desktop & Tablet) */}
            <Link 
              to="/donation"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-[1.03] active:scale-95"
            >
              <Heart size={15} fill="currentColor" className="text-slate-950 animate-pulse" />
              <span>{t.donate as string}</span>
            </Link>

            {/* Language Switcher */}
            <button 
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} 
              className="px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] uppercase flex items-center gap-1.5 bg-white dark:bg-slate-900 hover:border-blue-500 transition-all shadow-sm"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <Languages size={14} className="text-blue-600 dark:text-blue-400" /> 
              <span className="hidden sm:inline font-bold">{lang === 'bn' ? 'EN' : 'বাংলা'}</span>
              <span className="sm:hidden font-bold">{lang === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              id="theme-toggle-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-800 transition-all shadow-sm cursor-pointer"
              title={theme === 'light' ? (t.themeDark as string) : (t.themeLight as string)}
              aria-label={theme === 'light' ? (t.themeDark as string) : (t.themeLight as string)}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} className="text-amber-400" />}
            </button>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FULL DRAWER MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[90] no-print flex flex-col bg-slate-950/95 backdrop-blur-xl text-white animate-in fade-in duration-200">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrganizationSeal className="w-10 h-10" />
              <div>
                <h3 className="font-black text-sm text-white bengali leading-tight">
                  {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
                </h3>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bengali mt-0.5">
                  {lang === 'bn' ? 'প্রতিষ্ঠিত ১৯৮৮' : 'Established 1988'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : [
              { label: 'home', path: '/', icon: <Home size={18} /> },
              { label: 'about', path: '/about', icon: <Info size={18} /> },
              { label: 'events', path: '/events', icon: <Sparkles size={18} /> },
              { label: 'news', path: '/news', icon: <Newspaper size={18} /> },
              { label: 'notices', path: '/notices', icon: <BellRing size={18} /> },
              { label: 'gallery', path: '/gallery', icon: <ImageIcon size={18} /> },
              { label: 'leadership', path: '/leadership', icon: <Users size={18} /> },
              { label: 'impact', path: '/impact', icon: <PieChart size={18} /> },
              { label: 'donation', path: '/donation', icon: <Heart size={18} /> },
            ]).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all bengali ${
                    isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-amber-300' : 'text-blue-400'}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                    </span>
                    <span>{t[item.label as keyof typeof t] as string}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-500" />
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
              <Link
                to="/donation"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 text-sm uppercase tracking-wider bengali"
              >
                <Heart size={18} fill="currentColor" />
                <span>{t.donate as string}</span>
              </Link>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-2 text-slate-400">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <MapPin size={14} className="text-blue-400" />
                  <span>মিরবক্সটুলা, সিলেট-৩১০০, বাংলাদেশ</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <Phone size={14} className="text-amber-400" />
                  <span>+৮৮০ ১৭১২-৭৮২৫৬৪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CANVAS */}
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 md:py-12 pb-24 lg:pb-16">
        {children}
      </main>

      {/* MOBILE BOTTOM APP NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-[80] no-print pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-full shadow-2xl flex items-center justify-around px-2 py-1.5">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const isDonation = item.label === 'donation';

              if (isDonation) {
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="relative flex flex-col items-center -mt-8 transition-transform active:scale-95"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-slate-900">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { 
                        size: 24, 
                        className: "text-slate-950",
                        fill: 'currentColor'
                      })}
                    </div>
                    <span className="text-[9px] font-black mt-1 text-amber-400 uppercase tracking-tight bengali">
                      {t.donate as string}
                    </span>
                  </Link>
                );
              }

              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    isActive ? 'text-blue-400 font-black' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-500/20' : ''}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { 
                      size: 20, 
                      strokeWidth: isActive ? 2.5 : 2
                    })}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-tighter mt-0.5 bengali">
                    {t[item.label as keyof typeof t] as string}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* INSTITUTIONAL GLOBAL FOOTER */}
      <footer className="bg-slate-950 text-slate-300 pt-16 pb-28 md:pb-16 no-print border-t-2 border-amber-500/30 relative overflow-hidden">
        {/* Subtle Background Pattern Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 space-y-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            
            {/* Column 1: Organization Identity & Mission */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <OrganizationSeal className="w-12 h-12" />
                <div>
                  <h3 className="font-black text-base text-white leading-tight bengali">
                    {lang === 'bn' ? settings?.nameBn || 'আজাদী সমাজ কল্যাণ সংঘ' : settings?.nameEn || 'Azadi Social Welfare Organization'}
                  </h3>
                  <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mt-0.5 bengali">
                    {lang === 'bn' ? 'প্রতিষ্ঠিত: ১০ জুন ১৯৮৮' : 'Established: 10 June 1988'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bengali">
                {lang === 'bn' 
                  ? '১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘ সিলেটে শিক্ষা, সামাজিক কল্যাণ, তরুণ উন্নয়ন এবং আর্তমানবতার সেবায় নিবেদিত একটি অলাভজনক ও অরাজনৈতিক জনসেবামূলক সংস্থা।' 
                  : 'Since 1988, Azadi Social Welfare Organization has been dedicated to education, youth empowerment, sports, and humanitarian social welfare in Sylhet, Bangladesh.'
                }
              </p>

              <div className="inline-flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-[11px] font-bold text-slate-300">
                <Shield size={14} className="text-emerald-400" />
                <span>{lang === 'bn' ? 'স্বচ্ছতা ও কমপ্লায়েন্স নিশ্চিতকৃত' : 'Transparent & Verified NGO'}</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 border-b border-slate-800 pb-2 bengali">
                {lang === 'bn' ? 'নেভিগেশন ও লিংক' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.home as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.about as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.events as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.news as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/notices" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.notices as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.gallery as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/leadership" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.leadership as string}</span>
                  </Link>
                </li>
                <li>
                  <Link to="/impact" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 bengali">
                    <ChevronRight size={12} className="text-blue-500" />
                    <span>{t.impact as string}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 border-b border-slate-800 pb-2 bengali">
                {lang === 'bn' ? 'যোগাযোগ ও অবস্থান' : 'Contact & Address'}
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <span className="bengali">মিরবক্সটুলা, সিলেট-৩১০০, বাংলাদেশ</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={16} className="text-amber-400 shrink-0" />
                  <a href="tel:+8801712782564" className="hover:text-white transition-colors">+৮৮০ ১৭১২-৭৮২৫৬৪</a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={16} className="text-emerald-400 shrink-0" />
                  <a href="mailto:info@azadi.org" className="hover:text-white transition-colors">info@azadi.org</a>
                </div>
                
                <div className="pt-2 flex items-center gap-2">
                  <a 
                    href="https://wa.me/8801712782564" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp</span>
                  </a>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-blue-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Facebook size={13} />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Donate CTA & Admin Portal */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400 border-b border-slate-800 pb-2 bengali">
                {lang === 'bn' ? 'অংশগ্রহণ ও অনুদান' : 'Support Our Mission'}
              </h4>
              <p className="text-xs text-slate-400 bengali leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার সামান্য সাহায্য আমাদের সমাজিক কার্যক্রম ও সুবিধাবঞ্চিত মানুষের পাশে দাঁড়াতে সহায়তা করবে।'
                  : 'Your generous contribution powers our community development, education, and social support projects.'
                }
              </p>
              
              <Link 
                to="/donation"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 text-xs uppercase tracking-wider transition-all transform hover:scale-[1.02] active:scale-95 bengali"
              >
                <Heart size={16} fill="currentColor" />
                <span>{t.donate as string}</span>
              </Link>

              <div className="pt-2">
                <Link 
                  to="/admin" 
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-amber-400 transition-colors uppercase tracking-wider"
                >
                  <Lock size={12} />
                  <span>{lang === 'bn' ? 'এডমিন লগইন / প্রশাসনিক পোর্টাল' : 'Admin Portal Login'}</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p className="bengali text-center sm:text-left">
              © ১৯৮৮ - ২০২৬ <strong className="text-slate-300">আজাদী সমাজ কল্যাণ সংঘ</strong>। সর্বস্বত্ব সংরক্ষিত।
            </p>

            <a 
              href="https://wa.me/8801712782564" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 hover:text-amber-400 transition-colors"
            >
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                Crafted by <span className="text-white font-black group-hover:text-amber-300">Ahmad Hossain Pavel</span>
              </span>
              <Sparkles size={12} className="text-amber-400" />
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
};
