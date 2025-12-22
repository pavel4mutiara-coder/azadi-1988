
import React from 'react';
import { useApp } from '../AppContext';
import { TRANSLATIONS, NAV_ITEMS, ADMIN_NAV_ITEMS } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { 
  Moon, Sun, Languages, LogOut, Heart, MapPin, Phone, Mail, 
  Loader2, LayoutDashboard, Home, PieChart, Users, Calendar,
  ShieldCheck, Facebook, Youtube, MessageCircle
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

  const mobileNavItemsLeft = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[0], ADMIN_NAV_ITEMS[1]]
    : [NAV_ITEMS[0], NAV_ITEMS[1]];

  const mobileNavItemsRight = isAdmin && !isPublicPage 
    ? [ADMIN_NAV_ITEMS[3], ADMIN_NAV_ITEMS[4]]
    : [NAV_ITEMS[2], NAV_ITEMS[4]];

  const centerItem = isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS[2] : NAV_ITEMS[3];

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''} bg-slate-50 dark:bg-slate-950`} lang={lang}>
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 no-print">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-4 group min-w-0 flex-1 lg:flex-initial">
            <OrganizationSeal className="w-10 h-10 sm:w-14 sm:h-14" />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-[11px] sm:text-base lg:text-lg font-black uppercase tracking-tight leading-none text-emerald-900 dark:text-emerald-400 truncate">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>
              <p className="text-[7px] sm:text-[9px] opacity-70 text-slate-500 dark:text-slate-500 font-bold mt-1 tracking-wider uppercase truncate">
                {lang === 'bn' ? settings.sloganBn : settings.sloganEn}
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {(isAdmin && !isPublicPage ? ADMIN_NAV_ITEMS : NAV_ITEMS).map((item) => (
              <Link key={item.path} to={item.path} className={`text-[12px] font-black transition-all px-3 py-1.5 rounded-xl flex items-center gap-1.5 uppercase tracking-wide ${location.pathname === item.path ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-100 dark:border-emerald-400/20' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>
                {item.icon} {t[item.label as keyof typeof t] as string}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isPublicPage && (
              <Link to="/admin" className="p-1.5 sm:p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 transition-all items-center gap-1 text-[9px] sm:text-xs font-black uppercase flex group">
                <ShieldCheck size={16} className="group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">{t.admin}</span>
              </Link>
            )}

            <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="p-1.5 sm:p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all items-center gap-1 text-[9px] sm:text-xs font-black uppercase flex border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
              <Languages size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>{lang.toUpperCase()}</span>
            </button>
            
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 group shadow-sm">
              {theme === 'light' ? <Moon size={16} className="text-slate-600" /> : <Sun size={16} className="text-amber-400" />}
            </button>
            
            {isAdmin && <button onClick={logout} className="p-2 sm:p-2.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 transition-all"><LogOut size={16} /></button>}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 md:py-16 pb-32 lg:pb-16">
        {children}
      </main>

      {/* Universally Responsive Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 no-print safe-bottom">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"></div>
        
        <div className="px-4 pb-6 flex justify-center">
          <nav className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/40 rounded-[2.5rem] shadow-[0_15px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_50px_rgba(0,0,0,0.5)] flex items-center justify-between p-1.5 h-16 sm:h-20 ring-1 ring-black/5 dark:ring-white/5 relative">
            
            <div className="flex flex-1 justify-around items-center">
              {mobileNavItemsLeft.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 ${getNavColor(item.path, isActive)}`}>
                    <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: isActive ? 22 : 20 })}
                    </div>
                    {isActive && <span className="text-[8px] font-black uppercase tracking-tight mt-0.5 animate-in fade-in zoom-in-75 duration-300">{t[item.label as keyof typeof t] as string}</span>}
                  </Link>
                );
              })}
            </div>

            <div className="relative px-2 -top-4">
              <Link to={centerItem.path} className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${isAdmin && !isPublicPage ? 'from-slate-900 to-slate-700' : 'from-rose-600 to-pink-500'} text-white shadow-2xl border-[5px] border-slate-50 dark:border-slate-950 hover:scale-105 active:scale-95 transition-all group ring-4 ring-emerald-500/5`}>
                {isAdmin && !isPublicPage ? <LayoutDashboard size={28} /> : <Heart size={28} fill="white" />}
              </Link>
            </div>

            <div className="flex flex-1 justify-around items-center">
              {mobileNavItemsRight.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-300 ${getNavColor(item.path, isActive)}`}>
                    <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: isActive ? 22 : 20 })}
                    </div>
                    {isActive && <span className="text-[8px] font-black uppercase tracking-tight mt-0.5 animate-in fade-in zoom-in-75 duration-300">{t[item.label as keyof typeof t] as string}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-12 md:pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-4">
                <OrganizationSeal className="w-16 h-16" />
                <div>
                  <h2 className="text-xl font-black text-emerald-900 dark:text-emerald-400 leading-none">{lang === 'bn' ? settings.nameBn : settings.nameEn}</h2>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">{lang === 'bn' ? settings.sloganBn : settings.sloganEn}</p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                {lang === 'bn' ? "১৯৮৮ সাল থেকে আজাদী সমাজ কল্যাণ সংঘ মানবসেবায় নিবেদিত একটি অলাভজনক সামাজিক সংস্থা।" : "Dedicated to human service since 1988, Azadi Social Welfare Organization is a non-profit entity."}
              </p>
              
              {/* Social Media Links row */}
              <div className="flex items-center gap-4 pt-2">
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-blue-100 dark:border-blue-800" title="Facebook Page">
                    <Facebook size={20} />
                  </a>
                )}
                {settings.youtube && (
                  <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-red-100 dark:border-red-800" title="YouTube Channel">
                    <Youtube size={20} />
                  </a>
                )}
                {settings.whatsappChannel && (
                  <a href={settings.whatsappChannel} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-emerald-100 dark:border-emerald-800" title="WhatsApp Channel">
                    <MessageCircle size={20} />
                  </a>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-3 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2"><div className="w-4 h-px bg-emerald-500"></div>Quick Links</h3>
              <ul className="space-y-3">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}><Link to={item.path} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold flex items-center gap-2 group"><div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-emerald-500 transition-all"></div>{t[item.label as keyof typeof t] as string}</Link></li>
                ))}
              </ul>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2"><div className="w-4 h-px bg-emerald-500"></div>Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><MapPin size={18} className="text-emerald-600 mt-0.5" /><p className="text-xs font-black text-slate-700 dark:text-slate-300 leading-relaxed">{lang === 'bn' ? settings.addressBn : settings.addressEn}</p></div>
                <div className="flex items-center gap-3"><Phone size={18} className="text-emerald-600" /><p className="text-xs font-black text-slate-700 dark:text-slate-300">{settings.phone}</p></div>
                <div className="flex items-center gap-3"><Mail size={18} className="text-emerald-600" /><p className="text-xs font-black text-slate-700 dark:text-slate-300">{settings.email}</p></div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">© {new Date().getFullYear()} Azadi Social Welfare.</div>
            <div className="flex items-center gap-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Developed by</span><span className="text-[10px] font-black text-white bg-emerald-600 px-3 py-1 rounded-full shadow-md">Ahmed Hossain Pavel</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};
