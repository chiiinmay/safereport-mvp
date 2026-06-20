import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Send, Activity, Lock, Menu, X, AlertTriangle, Globe, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';
import { useLang } from '../i18n/LanguageContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();
  const [isSosLoading, setIsSosLoading] = useState(false);

  const handleSos = async () => {
    if (!window.confirm(t('nav.sosConfirm'))) return;
    setIsSosLoading(true);
    
    let coords = 'Unknown';
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });
      coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
    } catch (err) {
      console.warn("Could not retrieve GPS coordinates:", err);
    }

    const BASE = import.meta.env.VITE_API_URL || 'https://safereport-mvp.onrender.com';
    try {
      const res = await fetch(`${BASE}/api/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Campus Grounds', coordinates: coords })
      });
      const data = await res.json();
      if (res.ok) {
        alert(t('nav.sosTriggered') + data.caseId);
        navigate(`/track?case=${data.caseId}`);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (e) {
      alert(t('nav.sosFailed'));
    } finally {
      setIsSosLoading(false);
    }
  };

  const navItems = [
    { name: t('nav.home'), path: '/', icon: Home },
    { name: t('nav.submit'), path: '/submit', icon: Send },
    { name: t('nav.track'), path: '/track', icon: Activity },
    { name: t('nav.whatsapp'), path: '/whatsapp', icon: MessageCircle },
    { name: t('nav.admin'), path: '/admin', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col text-brand-dark" style={{ fontFamily: 'var(--font-body)' }}>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <Shield size={22} className="fill-white/20" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-brand-dark flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                SafeReport
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full uppercase tracking-wider">
                  DSATM
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">{t('nav.tagline')}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                    isActive
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-brand-dark"
                  )}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="h-5 w-px bg-slate-200 mx-2"></div>
            
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-brand-dark transition-colors border border-slate-200 rounded-lg hover:border-slate-300"
            >
              <Globe size={14} className="text-brand-primary" />
              {lang.toUpperCase()}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 w-full",
                        isActive
                          ? "bg-brand-primary text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-brand-dark"
                      )}
                    >
                      <Icon size={20} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="pt-2 pb-1 border-t border-slate-100 mt-2 flex justify-between items-center px-4">
                  <span className="text-sm font-medium text-slate-500">Language / भाषा</span>
                  <button 
                    onClick={toggleLang}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-brand-dark transition-colors border border-slate-200 rounded-lg hover:border-slate-300 bg-white"
                  >
                    <Globe size={14} className="text-brand-primary" />
                    {lang.toUpperCase()}
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>{t('nav.footerCopy')}</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
            <Lock size={14} className="text-brand-primary" />
            <span className="font-mono text-xs text-brand-primary tracking-widest">{t('nav.encrypted')}</span>
          </div>
        </div>
      </footer>

      <AIAssistant />
      
      {/* GLOBAL FLOATING SOS BUTTON — bottom-right, primary thumb zone */}
      <button
        onClick={handleSos}
        disabled={isSosLoading}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-lg hover:bg-red-700 hover:shadow-xl transition-all duration-200 border-2 border-red-500/30"
        aria-label="Emergency SOS"
      >
        <AlertTriangle size={20} />
        <span className="text-[9px] font-bold mt-0.5 tracking-wider">{t('nav.sos')}</span>
      </button>
    </div>
  );
}
