import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Send, MessageSquare, AlertCircle, Clock, Activity, ShieldCheck, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STATUS_CONFIG = {
  'Submitted': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', step: 1 },
  'Under Review': { color: 'bg-blue-100 text-blue-700 border-blue-200', step: 2 },
  'Investigation Active': { color: 'bg-purple-100 text-purple-700 border-purple-200', step: 3 },
  'Action Taken': { color: 'bg-orange-100 text-orange-700 border-orange-200', step: 4 },
  'Resolved': { color: 'bg-green-100 text-green-700 border-green-200', step: 5 },
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

  const fetchStatus = async (e) => {
    if (e) e.preventDefault();
    if (!caseId || !token) {
      setError("Both Case ID and Secret Token are required.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const BASE = import.meta.env.VITE_API_URL || '';
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
      const BASE = import.meta.env.VITE_API_URL || '';
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
    <div className="max-w-5xl mx-auto mt-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4">
          <Activity size={32} />
        </div>
        <h1 className="text-3xl font-bold text-brand-dark">Track Your Case</h1>
        <p className="text-gray-600 mt-2">Enter your Case ID and Secret Token to view status and communicate with the committee.</p>
      </div>

      <div className="glass-card p-6 mb-8 max-w-2xl mx-auto">
        <form onSubmit={fetchStatus} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Case ID</label>
              <input 
                type="text" 
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="SR-2026-..." 
                className="glass-input w-full font-mono"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Secret Token</label>
              <input 
                type="text" 
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Your secret token" 
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
                Checking...
              </>
            ) : (
              <>
                <Search size={18} />
                Check Status
              </>
            )}
          </button>
        </form>
        {error && (
          <p className="text-red-500 mt-4 text-sm font-medium flex items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle size={16}/>
            {error}
          </p>
        )}
      </div>

      {data && (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease-out]">
          {/* Status Progress Bar */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-6">Case Progress</h3>
            <div className="flex items-center justify-between min-w-[500px]">
              {ALL_STATUSES.map((status, index) => (
                <div key={status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                      index + 1 <= currentStep
                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    )}>
                      {index + 1 <= currentStep ? (
                        <ShieldCheck size={18} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-semibold mt-2 text-center max-w-[80px]",
                      index + 1 <= currentStep ? "text-brand-primary" : "text-gray-400"
                    )}>
                      {status}
                    </span>
                  </div>
                  {index < ALL_STATUSES.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all duration-500",
                      index + 1 < currentStep ? "bg-brand-primary" : "bg-gray-200"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Case Details Sidebar */}
            <div className="md:col-span-1 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-4">Case Details</h3>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Case ID</p>
                    <p className="font-mono font-bold text-brand-dark text-lg">{data.caseId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Current Status</p>
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm mt-1 border",
                      STATUS_CONFIG[data.status]?.color || 'bg-gray-100 text-gray-600 border-gray-200'
                    )}>
                      <Activity size={14} />
                      {data.status}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p className="text-sm font-medium text-brand-dark flex items-center gap-1.5 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      {new Date(data.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Refresh button */}
              <button
                onClick={() => fetchStatus()}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-2"
              >
                <svg className={loading ? "animate-spin" : ""} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Refresh Status
              </button>
            </div>

            {/* Chat Panel */}
            <div className="md:col-span-2 glass-card flex flex-col h-[550px]">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-white/50 rounded-t-2xl">
                <MessageSquare size={20} className="text-brand-primary" />
                <h3 className="font-bold text-brand-dark">Anonymous Two-Way Chat</h3>
                <span className="ml-auto text-xs text-gray-400 font-medium">{data.messages?.length || 0} messages</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                {(!data.messages || data.messages.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare size={28} className="opacity-30" />
                    </div>
                    <p className="font-medium">No messages yet</p>
                    <p className="text-xs text-center max-w-xs">Send a message below to start communicating with the committee anonymously.</p>
                  </div>
                ) : (
                  data.messages.map((m, i) => (
                    <div key={i} className={cn("flex flex-col max-w-[80%]", m.sender === 'reporter' ? "ml-auto items-end" : "mr-auto items-start")}>
                      <span className="text-xs text-gray-500 mb-1 px-1">
                        {m.sender === 'reporter' ? 'You' : '🔵 Committee'} • {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm shadow-sm",
                        m.sender === 'reporter' 
                          ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-tr-sm" 
                          : "bg-white border border-gray-200 text-brand-dark rounded-tl-sm"
                      )}>
                        {m.body}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white/80 border-t border-gray-100 rounded-b-2xl">
                <form onSubmit={handleReply} className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a secure message..."
                    className="flex-1 px-4 py-3 bg-gray-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={sending || !reply.trim()} 
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-3 rounded-xl hover:shadow-lg hover:shadow-brand-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
