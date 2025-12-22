
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, LogOut, Heart, MapPin, Phone, Mail, 
  Loader2, LayoutDashboard, Home, PieChart, Users, Calendar,
  ShieldCheck, Facebook, Youtube, MessageCircle, Lock, ShieldAlert
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, theme, setTheme, isAdmin, logout, settings, isLoaded } = useApp();
  const location = useLocation();
  const t = TRANSLATIONS[lang];
  const isPublicPage = !location.pathname.startsWith('/admin');

  const OrganizationSeal = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`${className} relative rounded-full border-[2px] sm:border-[3px] border-emerald-600 dark:border-emerald-500 bg-white p-1 shadow-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-all duration-300 ring-4 ring-emerald-500/10 shrink-0`}>
      <div className="absolute inset-0 border-[2px] sm:border-[4px] border-emerald-50 dark:border-emerald-950/20 rounded-full"></div>
      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white relative z-10">
        <img 
          src={settings.logo} 
          alt="Organization Logo" 
          className="w-full h-full object-contain p-0.5" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://lh3.googleusercontent.com/d/1qvQUx-Qph8aIIJY3liQ9iBSzFcnqKalh';
          }}
        />
      </div>
    </div>
  );

  const getNavColor = (path: string, isActive: boolean) => {
    if (!isActive) return 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400';
    switch(path) {
      case '/': return 'text-emerald-600 dark:text-emerald-400';
      case '/leadership': return 'text-amber-600 dark:text-amber-400';
      case '/events': return 'text-blue-600 dark:text-blue-400';
      case '/donation': return 'text-rose-600 dark:text-rose-400';
      case '/impact': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-emerald-600 dark:text-emerald-400';
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

  const mobileNavItemsLeft = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[0], ADMIN_NAV_ITEMS[1]]
    : [NAV_ITEMS[0], NAV_ITEMS[1]];

  const mobileNavItemsRight = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[3], ADMIN_NAV_ITEMS[4]]
    : [NAV_ITEMS[2], NAV_ITEMS[4]];

  const centerItem = isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS[2] : NAV_ITEMS[3];

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`} lang={lang}>
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 no-print shadow-sm">
        <div className="container mx-auto px-4 h-18 sm:h-22 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group min-w-0 flex-1 lg:flex-initial">
            <OrganizationSeal className="w-12 h-12 sm:w-16 sm:h-16" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-[12px] sm:text-lg lg:text-xl font-black uppercase tracking-tight leading-none text-emerald-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors bengali">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>
              <p className="text-[8px] sm:text-[10px] opacity-80 text-emerald-700 dark:text-emerald-500 font-black mt-1.5 tracking-wider uppercase truncate bengali">
                {lang === 'bn' ? settings.sloganBn : settings.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => (
              <Link key={item.path} to={item.path} className={`text-[13px] font-black transition-all px-4 py-2 rounded-xl flex items-center gap-2 uppercase tracking-wide ${location.pathname === item.path ? 'text-emerald-700 dark:text-white bg-emerald-100/60 dark:bg-emerald-600 shadow-md scale-105' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'} bengali`}>
                {item.icon} {t[item.label as keyof typeof t] as string}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Admin Entry Button */}
            <Link to="/admin" title={isAdmin ? t.dashboard : t.adminLogin} className={`p-2.5 sm:p-3 rounded-xl transition-all border shadow-sm flex items-center gap-2 ${isAdmin ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200'}`}>
              <ShieldAlert size={18} />
              <span className="hidden xl:inline text-[10px] font-black uppercase tracking-widest bengali">
                {isAdmin ? (lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard') : (lang === 'bn' ? 'এডমিন' : 'Admin')}
              </span>
            </Link>

            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="p-2 sm:p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase flex border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <Languages size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>{lang.toUpperCase()}</span>
            </button>
            
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2.5 sm:p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 group shadow-sm">
              {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400 animate-pulse" />}
            </button>
            
            {isAdmin && <button onClick={logout} className="p-2.5 sm:p-3 rounded-xl text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 transition-all hover:bg-red-600 hover:text-white"><LogOut size={18} /></button>}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-20 pb-40 lg:pb-20">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 md:pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 pb-16">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-5">
                <OrganizationSeal className="w-20 h-20" />
                <div>
                  <h2 className="text-2xl font-black text-emerald-900 dark:text-white leading-tight bengali">{lang === 'bn' ? settings.nameBn : settings.nameEn}</h2>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 mt-1.5 uppercase tracking-widest bengali">{lang === 'bn' ? settings.sloganBn : settings.sloganEn}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-base font-bold leading-relaxed max-w-lg bengali">
                {lang === 'bn' ? "১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘ মানবসেবায় নিবেদিত একটি অলাভজনক সামাজিক সংস্থা।" : "Dedicated to human service since 1988, Azadi Social Welfare Organization is a non-profit entity."}
              </p>
              
              <div className="flex items-center gap-5 pt-4">
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:scale-110 transition-all shadow-md border border-blue-100 dark:border-blue-800">
                    <Facebook size={24} />
                  </a>
                )}
                {settings.youtube && (
                  <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:scale-110 transition-all shadow-md border border-red-100 dark:border-red-800">
                    <Youtube size={24} />
                  </a>
                )}
                {settings.whatsappChannel && (
                  <a href={settings.whatsappChannel} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:scale-110 transition-all shadow-md border border-emerald-100 dark:border-emerald-800">
                    <MessageCircle size={24} />
                  </a>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3 bengali"><div className="w-6 h-1 bg-emerald-500 rounded-full"></div>{lang === 'bn' ? 'দ্রুত লিঙ্ক' : 'Quick Links'}</h3>
              <ul className="space-y-4">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-black flex items-center gap-3 group transition-all bengali"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 group-hover:scale-125 transition-all"></div>{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
                <li><Link to="/admin" className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-black flex items-center gap-3 group transition-all bengali"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 group-hover:scale-125 transition-all"></div>{lang === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}</Link></li>
              </ul>
            </div>
            
            <div className="lg:col-span-4 space-y-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-3 bengali"><div className="w-6 h-1 bg-emerald-500 rounded-full"></div>{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800"><MapPin size={20} /></div>
                  <p className="text-sm font-black leading-relaxed bengali">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800"><Phone size={20} /></div>
                  <p className="text-sm font-black">{settings.phone}</p>
                </div>
                <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800"><Mail size={20} /></div>
                  <p className="text-sm font-black truncate">{settings.email}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">© {new Date().getFullYear()} Azadi Social Welfare. All Rights Reserved.</div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest">System Architect</span>
              <span className="text-[10px] font-black text-white bg-emerald-600 dark:bg-emerald-500 px-4 py-1.5 rounded-full shadow-lg">Ahmed Hossain Pavel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
