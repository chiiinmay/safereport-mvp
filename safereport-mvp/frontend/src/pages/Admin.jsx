import { useState, useEffect } from 'react';
import { Lock, Search, RefreshCw, AlertCircle, MessageSquare, Clock, ShieldAlert, FileIcon, TrendingUp, BarChart3, AlertTriangle, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Admin() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('safereport_admin_key') || '');
  const [role, setRole] = useState(localStorage.getItem('safereport_admin_role') || 'Department Head');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState({ categories: [], escalations: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [reply, setReply] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminKey.trim()) {
      localStorage.setItem('safereport_admin_key', adminKey.trim());
      localStorage.setItem('safereport_admin_role', role);
      setIsAuthenticated(true);
      fetchData();
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const BASE = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${BASE}/api/admin/reports`, {
        headers: { 'x-admin-key': adminKey, 'x-role': role }
      });
      if (!res.ok) throw new Error('Unauthorized or failed to fetch cases.');
      const data = await res.json();
      setCases(data);

      const statRes = await fetch(`${BASE}/api/admin/analytics`, {
        headers: { 'x-admin-key': adminKey, 'x-role': role }
      });
      if (statRes.ok) {
        const statData = await statRes.json();
        setAnalytics(statData);
      }
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      localStorage.removeItem('safereport_admin_key');
    } finally {
      setLoading(false);
    }
  };

  const loadCaseDetails = async (caseId) => {
    setSelectedCase(caseId);
    const BASE = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${BASE}/api/admin/reports/${caseId}`, {
        headers: { 'x-admin-key': adminKey, 'x-role': role }
      });
      if (!res.ok) throw new Error('Failed to load case details.');
      const data = await res.json();
      setCaseDetails(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${BASE}/api/admin/reports/${selectedCase}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey, 'x-role': role },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
      loadCaseDetails(selectedCase);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm("Are you sure you want to escalate this case?")) return;
    try {
      const BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${BASE}/api/admin/reports/${selectedCase}/escalate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey, 'x-role': role }
      });
      if (!res.ok) throw new Error('Failed to escalate case');
      fetchData();
      loadCaseDetails(selectedCase);
    } catch (err) {
      alert(err.message);
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      const BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${BASE}/api/admin/reports/${selectedCase}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey, 'x-role': role },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setReply('');
      loadCaseDetails(selectedCase);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, role]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 animate-fade-in">
        <div className="glass-card p-8 text-center border-gray-200 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 border-2 border-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-primary">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark mb-2">Secure Command Center</h2>
          <p className="text-gray-500 mb-8 text-sm">Authorized personnel only. All access is logged.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">Access Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="glass-input cursor-pointer mb-4"
              >
                <option value="Department Head">Department Head (Level 0)</option>
                <option value="Committee">Anti-Harassment Committee (Level 1)</option>
                <option value="Police">Principal / Police (Level 2)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">Authentication Key</label>
              <input 
                type="password" 
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Admin Key"
                className="glass-input text-center tracking-widest font-mono"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full shadow-lg">Initialize Session</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-140px)] animate-fade-in">
      {/* Left Column: Case List */}
      <div className="lg:col-span-1 glass-card flex flex-col overflow-hidden border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
              <Search size={18} className="text-brand-primary" />
              Active Cases
            </h3>
            <p className="text-[10px] uppercase font-bold text-brand-primary mt-1 tracking-widest">Role: {role}</p>
          </div>
          <button onClick={fetchData} className="text-gray-400 hover:text-brand-primary transition-colors">
            <RefreshCw size={18} className={loading ? 'animate-spin text-brand-primary' : ''} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white custom-scrollbar">
          {cases.map(c => {
            const isHighThreat = c.threat_score >= 75;
            return (
              <button
                key={c.case_id}
                onClick={() => loadCaseDetails(c.case_id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
                  selectedCase === c.case_id 
                    ? "bg-blue-50 border-brand-primary/50 shadow-sm" 
                    : isHighThreat 
                      ? "bg-red-50 border-red-200 hover:bg-red-100"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                )}
              >
                {isHighThreat && <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>}
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("font-mono text-sm font-bold", isHighThreat ? "text-red-600" : "text-brand-dark")}>
                    {c.case_id}
                  </span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-500 font-bold border border-gray-200">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-medium text-gray-700 text-sm truncate">{c.category}</div>
                <div className="flex justify-between items-center mt-3">
                  <div className="text-[10px] text-brand-primary font-bold uppercase tracking-wider bg-blue-100 px-2 py-1 rounded border border-blue-200">
                    {c.status}
                  </div>
                  {isHighThreat && <ShieldAlert size={14} className="text-red-500" />}
                </div>
              </button>
            )
          })}
          {cases.length === 0 && !loading && (
            <div className="text-center p-8 text-gray-500 text-sm">No cases accessible at this level.</div>
          )}
        </div>
      </div>

      {/* Right Column: Details OR Analytics */}
      <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden border-gray-200 relative">
        {!caseDetails ? (
          <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-brand-dark mb-6 flex items-center gap-3">
              <BarChart3 className="text-brand-primary" />
              Trend Analytics Dashboard
            </h2>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Total Reports</h3>
                <p className="text-5xl font-bold text-brand-primary">{cases.length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4">High Threat Cases</h3>
                <p className="text-5xl font-bold text-red-600">{cases.filter(c => c.threat_score >= 75).length}</p>
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Reports by Category</h3>
            <div className="space-y-4">
              {analytics.categories.map((c, i) => {
                const percentage = Math.round((c.count / cases.length) * 100) || 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-48 text-sm text-gray-600 truncate">{c.category}</div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${percentage}%` }}></div>
                    </div>
                    <div className="w-12 text-right text-sm font-bold text-gray-500">{c.count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Case Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold font-mono text-brand-dark flex items-center gap-3">
                    {caseDetails.case_id}
                    {caseDetails.threat_score >= 75 && (
                      <span className="text-[10px] bg-red-100 text-red-600 border border-red-200 px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest font-sans">
                        <AlertTriangle size={12} /> High Threat
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-500 font-medium mt-1 text-sm">{caseDetails.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleEscalate}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg border border-orange-600 transition-colors shadow-sm"
                  >
                    ESCALATE ↑
                  </button>
                  <select 
                    value={caseDetails.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="bg-white border border-gray-300 text-brand-dark text-sm font-bold rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-primary outline-none cursor-pointer"
                  >
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Investigation Active</option>
                    <option>Action Taken</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Threat Score</p>
                  <p className={cn("text-xl font-bold", caseDetails.threat_score >= 75 ? "text-red-600" : "text-brand-primary")}>{caseDetails.threat_score}/100</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm col-span-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Escalation Level</p>
                  <p className="text-sm font-bold text-brand-dark mt-1">{caseDetails.escalated_to} (Level {caseDetails.escalation_level})</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Date</p>
                  <p className="text-sm font-bold text-brand-dark mt-1">{caseDetails.incident_date || 'Unknown'}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200 relative shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">{caseDetails.description}</p>
              </div>

              {/* Evidence Vault */}
              {caseDetails.attachments && caseDetails.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileIcon size={14} /> Evidence Vault
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {caseDetails.attachments.map((file, i) => (
                      <a key={i} href={file} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 hover:border-brand-primary rounded-lg text-xs text-brand-primary transition-colors shadow-sm">
                        <FileIcon size={14} />
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Chat Transcript */}
              {caseDetails.ai_chat_log && caseDetails.ai_chat_log.length > 1 && (
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Bot size={14} /> Pre-Submission AI Chat Transcript
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-3 custom-scrollbar shadow-inner">
                    {caseDetails.ai_chat_log.map((m, i) => (
                      <div key={i} className={cn("flex flex-col max-w-[90%]", m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                        <span className="text-[10px] text-gray-400 font-bold tracking-wider mb-1 px-1 uppercase">
                          {m.role === 'user' ? 'Anonymous Reporter' : 'AI Guardian'}
                        </span>
                        <div className={cn(
                          "px-3 py-2 rounded-xl text-xs shadow-sm",
                          m.role === 'user' 
                            ? "bg-brand-primary text-white rounded-tr-none" 
                            : "bg-white border border-gray-200 text-gray-700 rounded-tl-none"
                        )}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar">
              {caseDetails.messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col max-w-[80%]", m.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start")}>
                  <span className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 px-1 uppercase">
                    {m.sender === 'admin' ? 'Security Staff' : 'Anonymous Reporter'} • {new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm shadow-sm",
                    m.sender === 'admin' 
                      ? "bg-brand-primary text-white rounded-tr-none border border-brand-primary/50" 
                      : "bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-none"
                  )}>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <form onSubmit={sendReply} className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Send an encrypted message to the reporter..."
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-brand-dark rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-primary outline-none transition-all placeholder:text-gray-400"
                />
                <button 
                  type="submit" 
                  disabled={!reply.trim()} 
                  className="bg-brand-primary border border-brand-primary/50 text-white px-6 py-3 font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare size={20} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
