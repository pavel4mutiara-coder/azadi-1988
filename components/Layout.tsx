
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, LogOut, Heart, MapPin, Phone, Mail, 
  Loader2, LayoutDashboard, Home, PieChart, Users, Calendar,
  ShieldCheck, Lock
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, logout, settings, isLoaded } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  const OrganizationSeal = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`${className} relative rounded-full border-[2px] sm:border-[3px] border-emerald-600 dark:border-emerald-500 bg-white p-1 sm:p-1.5 shadow-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-300 ring-4 ring-emerald-500/10 shrink-0`}>
      <div className="absolute inset-0 border-[2px] sm:border-[4px] border-emerald-50 dark:border-emerald-950/20 rounded-full"></div>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white relative z-10">
        <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
      </div>
    </div>
  );

  const getNavColor = (path: string, isActive: boolean) => {
    if (!isActive) return 'text-slate-400 dark:text-slate-500 hover:scale-110';
    switch(path) {
      case '/': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-400/20';
      case '/leadership': return 'text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-400/20';
      case '/events': return 'text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-400/20';
      case '/donation': return 'text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-400/20';
      case '/impact': return 'text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-400/20';
      default: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-400/20';
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 z-[9999]">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
          <Heart className="absolute inset-0 m-auto w-6 h-6 text-emerald-500 animate-pulse" fill="currentColor" />
        </div>
        <p className="font-black text-xl text-emerald-900 dark:text-emerald-400 uppercase tracking-widest">Azadi Social Welfare</p>
      </div>
    );
  }

  // Final mobile nav layout: [Home] [Leadership] [Donation (Center)] [Events] [Impact (Far Right)]
  const mobileNavItemsLeft = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[0], ADMIN_NAV_ITEMS[1]]
    : [NAV_ITEMS[0], NAV_ITEMS[1]];

  const mobileNavItemsRight = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[3], ADMIN_NAV_ITEMS[4]]
    : [NAV_ITEMS[2], NAV_ITEMS[4]];

  const centerItem = isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS[2] : NAV_ITEMS[3];

  return (
    <div className={`flex flex-col min-h-screen pb-28 lg:pb-0 transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950`} lang={lang}>
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group min-w-0 flex-1 sm:flex-initial">
            <OrganizationSeal className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="flex flex-col justify-center min-w-0 overflow-hidden">
              <h1 className="text-[12px] sm:text-lg font-black uppercase tracking-tight leading-tight text-emerald-900 dark:text-emerald-400 truncate whitespace-nowrap">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>
              <p className="text-[8px] sm:text-[10px] opacity-80 text-slate-500 dark:text-slate-500 font-bold mt-1 tracking-wider uppercase truncate whitespace-nowrap">
                {lang === 'bn' ? settings.sloganBn : settings.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => (
              <Link key={item.path} to={item.path} className={`text-[13px] font-black transition-all px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-wide ${location.pathname === item.path ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-100 dark:border-emerald-400/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>
                {item.icon} {t[item.label as keyof typeof t] as string}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Admin Panel Button */}
            {isPublicPage && (
              <Link to="/admin" className="p-2 sm:p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 transition-all items-center gap-2 text-[10px] sm:text-xs font-black uppercase flex group">
                <ShieldCheck size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">{t.admin}</span>
              </Link>
            )}

            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="p-2 sm:p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all items-center gap-2 text-[10px] sm:text-xs font-black uppercase flex">
              <Languages size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-700 dark:text-slate-300 hidden xs:inline">{lang.toUpperCase()}</span>
            </button>
            
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 group shadow-sm">
              {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400" />}
            </button>
            
            {isAdmin && <button onClick={logout} className="p-2.5 sm:p-3 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 transition-all"><LogOut size={18} /></button>}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-16">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (App-style) */}
      <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center no-print">
        <nav className="w-full max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/40 dark:border-slate-800/60 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex items-center justify-between p-2 h-22 ring-1 ring-black/5 dark:ring-white/5">
          <div className="flex flex-1 justify-around items-center">
            {mobileNavItemsLeft.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-[1.75rem] transition-all duration-500 ${getNavColor(item.path, isActive)}`}>
                  <div className={`transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: isActive ? 24 : 22 })}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-50 absolute invisible'}`}>{t[item.label as keyof typeof t] as string}</span>
                </Link>
              );
            })}
          </div>

          <div className="relative -mt-12 px-3">
            <Link to={centerItem.path} className={`flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr ${isAdmin && !isPublicPage ? 'from-slate-900 to-slate-700' : 'from-rose-600 to-pink-400'} text-white shadow-[0_15px_35px_rgba(0,0,0,0.3)] border-[6px] border-slate-50 dark:border-slate-900 hover:scale-110 active:scale-90 transition-all group ring-4 ring-emerald-500/10`}>
              {isAdmin && !isPublicPage ? <LayoutDashboard size={32} /> : <Heart size={32} fill="white" />}
            </Link>
          </div>

          <div className="flex flex-1 justify-around items-center">
            {mobileNavItemsRight.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-[1.75rem] transition-all duration-500 ${getNavColor(item.path, isActive)}`}>
                  <div className={`transition-all duration-500 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: isActive ? 24 : 22 })}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-50 absolute invisible'}`}>{t[item.label as keyof typeof t] as string}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <footer className="hidden md:block bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-16">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-5">
                <OrganizationSeal className="w-24 h-24" />
                <div>
                  <h2 className="text-3xl font-black text-emerald-900 dark:text-emerald-400 leading-none">{lang === 'bn' ? settings.nameBn : settings.nameEn}</h2>
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-[0.3em]">{lang === 'bn' ? settings.sloganBn : settings.sloganEn}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
                {lang === 'bn' ? "১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘ মানবসেবায় নিবেদিত একটি অলাভজনক সামাজিক সংস্থা।" : "Dedicated to human service since 1988, Azadi Social Welfare Organization is a non-profit entity."}
              </p>
            </div>
            <div className="lg:col-span-3 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white flex items-center gap-3"><div className="w-6 h-px bg-emerald-500"></div>Quick Links</h3>
              <ul className="space-y-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-bold flex items-center gap-3 group"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition-all"></div>{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-4 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-900 dark:text-white flex items-center gap-3"><div className="w-6 h-px bg-emerald-500"></div>Contact</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-5"><div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><MapPin size={22} /></div><p className="text-sm font-black text-slate-700 dark:text-slate-300 leading-relaxed">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p></div>
                <div className="flex items-center gap-5"><div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl"><Phone size={22} /></div><p className="text-sm font-black text-slate-700 dark:text-slate-300">{settings.phone}</p></div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Azadi Social Welfare Organization.</div>
            <div className="flex items-center gap-3"><span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em]">Developed by</span><span className="text-[11px] font-black text-white bg-emerald-600 px-4 py-1.5 rounded-full shadow-lg">Ahmed Hossain Pavel</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
