import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Send, Activity, Lock, Menu, X, AlertTriangle, Globe, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AIAssistant from './AIAssistant';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [isSosLoading, setIsSosLoading] = useState(false);

  const handleSos = async () => {
    if (!window.confirm("CRITICAL WARNING: This will immediately dispatch campus security. Are you sure?")) return;
    setIsSosLoading(true);
    try {
      // Mock geolocation
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: 'Campus Grounds', coordinates: '12.82, 77.50' })
      });
      const data = await res.json();
      if (res.ok) {
        alert("EMERGENCY TRIGGERED. Security is on the way. Your Case ID is: " + data.caseId);
        navigate(`/track?case=${data.caseId}`);
      }
    } catch (e) {
      alert("Failed to send SOS. Please call emergency services directly.");
    } finally {
      setIsSosLoading(false);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Submit Report', path: '/submit', icon: Send },
    { name: 'Track Case', path: '/track', icon: Activity },
    { name: 'WhatsApp', path: '/whatsapp', icon: MessageCircle },
    { name: 'Admin', path: '/admin', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-brand-dark">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Shield size={28} className="fill-white/20" />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-brand-dark flex items-center gap-2">
                SafeReport
                <span className="text-xs font-semibold px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-full uppercase tracking-wider">
                  DSATM
                </span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">Encrypted Campus Reporting</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300",
                    isActive
                      ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                      : "text-gray-600 hover:bg-gray-100 hover:text-brand-dark"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            <button 
              onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:text-brand-dark transition-colors border border-gray-300 rounded-lg hover:border-gray-500"
            >
              <Globe size={16} className="text-brand-primary" />
              {lang}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl animate-[slideDown_0.2s_ease-out]">
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
                        ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                        : "text-gray-600 hover:bg-gray-100 hover:text-brand-dark"
                    )}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} DSATM SafeReport Project. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-2 md:mt-0 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
            <Lock size={14} className="text-brand-primary" />
            <span className="font-mono text-xs text-brand-primary tracking-widest">AES-256 ENCRYPTED</span>
          </div>
        </div>
      </footer>

      <AIAssistant />
      
      {/* GLOBAL FLOATING SOS BUTTON */}
      <button
        onClick={handleSos}
        disabled={isSosLoading}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-red-600 rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_25px_rgba(220,38,38,0.6)] hover:scale-110 hover:bg-red-500 transition-all duration-300 group border-2 border-red-400/50"
      >
        <AlertTriangle size={24} className="group-hover:animate-ping absolute opacity-50" />
        <AlertTriangle size={24} className="relative z-10" />
        <span className="text-[10px] font-bold mt-0.5 tracking-wider">SOS</span>
      </button>
    </div>
  );
}
