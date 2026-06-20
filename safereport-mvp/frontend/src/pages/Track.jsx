import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, MessageSquare, AlertCircle, Clock, Activity, ShieldCheck, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STATUS_CONFIG = {
  'Submitted': { color: 'bg-amber-50 text-amber-700 border-amber-200', step: 1 },
  'Under Review': { color: 'bg-blue-50 text-blue-700 border-blue-200', step: 2 },
  'Investigation Active': { color: 'bg-violet-50 text-violet-700 border-violet-200', step: 3 },
  'Action Taken': { color: 'bg-orange-50 text-orange-700 border-orange-200', step: 4 },
  'Resolved': { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', step: 5 },
};

const ALL_STATUSES = ['Submitted', 'Under Review', 'Investigation Active', 'Action Taken', 'Resolved'];

export default function Track() {
  const [searchParams] = useSearchParams();
  const [caseId, setCaseId] = useState(searchParams.get('case') || '');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const { t } = useLang();

  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case 'Submitted': return t('track.statusSubmitted');
      case 'Under Review': return t('track.statusUnderReview');
      case 'Investigation Active': return t('track.statusInvestigation');
      case 'Action Taken': return t('track.statusAction');
      case 'Resolved': return t('track.statusResolved');
      default: return statusKey;
    }
  };

  const fetchStatus = async (e) => {
    if (e) e.preventDefault();
    if (!caseId || !token) {
      setError(t('track.errorBoth'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const BASE = import.meta.env.VITE_API_URL || 'https://safereport-mvp.onrender.com';
    try {
      const res = await fetch(`${BASE}/api/reports/${encodeURIComponent(caseId.trim())}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!res.ok) throw new Error('Case not found or token invalid.');
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    setSending(true);
    try {
      const BASE = import.meta.env.VITE_API_URL || 'https://safereport-mvp.onrender.com';
      const res = await fetch(`${BASE}/api/reports/${encodeURIComponent(data.caseId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), body: reply.trim() }),
      });
      
      if (!res.ok) throw new Error('Failed to send message.');
      
      setReply('');
      await fetchStatus(); // refresh data
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const currentStep = data ? (STATUS_CONFIG[data.status]?.step || 1) : 0;

  return (
    <motion.div
      className="max-w-5xl mx-auto mt-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-sm mx-auto mb-4">
          <Activity size={28} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>
          {t('track.title')}
        </h1>
        <p className="text-slate-600 mt-2 text-sm sm:text-base">{t('track.subtitle')}</p>
      </div>

      <div className="glass-card p-5 sm:p-6 mb-8 max-w-2xl mx-auto">
        <form onSubmit={fetchStatus} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('track.caseIdLabel')}</label>
              <input 
                type="text" 
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder={t('track.caseIdPlaceholder')} 
                className="glass-input w-full font-mono"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('track.tokenLabel')}</label>
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t('track.tokenPlaceholder')} 
                className="glass-input w-full font-mono"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('track.checking')}
              </>
            ) : (
              <>
                <Search size={16} />
                {t('track.checkBtn')}
              </>
            )}
          </button>
        </form>
        {error && (
          <p className="text-red-600 mt-4 text-sm font-medium flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle size={16}/>
            {error}
          </p>
        )}
      </div>

      {data && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Status Progress Bar */}
          <div className="glass-card p-5 sm:p-6 overflow-x-auto">
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-5">{t('track.caseProgress')}</h3>
            <div className="flex items-center justify-between min-w-[480px]">
              {ALL_STATUSES.map((status, index) => (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                       "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                      index + 1 <= currentStep
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    )}>
                      {index + 1 <= currentStep ? (
                        <ShieldCheck size={16} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold mt-2 text-center max-w-[80px]",
                      index + 1 <= currentStep ? "text-brand-primary" : "text-slate-400"
                    )}>
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  {index < ALL_STATUSES.length - 1 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2 rounded-full transition-all duration-500",
                      index + 1 < currentStep ? "bg-brand-primary" : "bg-slate-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Case Details Sidebar */}
            <div className="md:col-span-1 space-y-4">
              <div className="glass-card p-5">
                <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-4">{t('track.caseDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('track.caseIdLabel')}</p>
                    <p className="font-mono font-bold text-brand-dark text-base">{data.caseId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('track.currentStatus')}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs mt-1 border",
                      STATUS_CONFIG[data.status]?.color || 'bg-slate-100 text-slate-600 border-slate-200'
                    )}>
                      <Activity size={12} />
                      {getStatusLabel(data.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('track.lastUpdated')}</p>
                    <p className="text-sm font-medium text-brand-dark flex items-center gap-1.5 mt-1">
                      <Clock size={13} className="text-slate-400" />
                      {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => fetchStatus()}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2"
              >
                <svg className={loading ? "animate-spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                {t('track.refreshBtn')}
              </button>
            </div>

            {/* Chat Panel */}
            <div className="md:col-span-2 glass-card flex flex-col h-[500px] sm:h-[550px]">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-white/80 rounded-t-2xl">
                <MessageSquare size={18} className="text-brand-primary" />
                <h3 className="font-bold text-brand-dark text-sm" style={{ fontFamily: 'var(--font-heading)' }}>{t('track.chatTitle')}</h3>
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  {data.messages?.length || 0} {t('track.messages')}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
                {(!data.messages || data.messages.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                      <MessageSquare size={24} className="opacity-30" />
                    </div>
                    <p className="font-medium text-sm">{t('track.noMessages')}</p>
                    <p className="text-xs text-center max-w-xs">{t('track.noMessagesHint')}</p>
                  </div>
                ) : (
                  data.messages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col max-w-[80%]", m.sender === 'reporter' ? "ml-auto items-end" : "mr-auto items-start")}>
                      <span className="text-[10px] text-slate-500 mb-1 px-1">
                        {m.sender === 'reporter' ? t('track.you') : t('track.committee')} • {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        m.sender === 'reporter' 
                          ? "bg-brand-primary text-white rounded-tr-sm" 
                          : "bg-white border border-slate-200 text-brand-dark rounded-tl-sm"
                      )}>
                        {m.body}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 sm:p-4 bg-white/80 border-t border-slate-100 rounded-b-2xl">
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={t('track.chatPlaceholder')}
                    className="flex-1 px-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none transition-all text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !reply.trim()} 
                    className="bg-brand-primary text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
