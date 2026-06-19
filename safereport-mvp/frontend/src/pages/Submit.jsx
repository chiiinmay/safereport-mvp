import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2, Copy, Check, ShieldAlert, FileText, ArrowRight, Upload, Lock } from 'lucide-react';

export default function Submit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.target);
    
    // Append AI chat log if exists
    const aiChatLog = localStorage.getItem('safereport_ai_chat');
    if (aiChatLog) {
      formData.append('ai_chat_log', aiChatLog);
    }

    const BASE = import.meta.env.VITE_API_URL || 'https://safereport-mvp.onrender.com';
    try {
      const res = await fetch(`${BASE}/api/reports`, {
        method: 'POST',
        // Do not set Content-Type header when sending FormData!
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to submit report. Please try again.');
      
      const data = await res.json();
      setResult(data);
      localStorage.removeItem('safereport_ai_chat'); // clear the mock AI chat
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
        <div className="glass-card p-8 md:p-12 text-center space-y-6 border-green-200/50 relative overflow-hidden">
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-green-500/30">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="relative text-3xl font-bold text-brand-dark">Encrypted & Submitted</h2>
          <p className="relative text-gray-600">Your report has been securely vaulted with AES-256 encryption.</p>
          
          {result.threatScore > 50 && (
            <div className="relative bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 text-sm mt-4">
              <span className="font-bold">⚠️ High Priority Alert Generated.</span> The system has flagged this report for immediate administrative review.
            </div>
          )}
          
          <div className="relative bg-white rounded-2xl p-6 border-2 border-red-200 shadow-sm mt-8 space-y-6 text-left">
            <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">
                ⚠️ CRITICAL: Write these down immediately! They are the ONLY way to check your report status and chat with the committee. They will NEVER be shown again.
              </p>
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Case ID</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-lg font-mono text-brand-dark select-all">
                  {result.caseId}
                </code>
                <button 
                  onClick={() => copyToClipboard(result.caseId, 'caseId')} 
                  className="p-3 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Copy Case ID"
                >
                  {copiedField === 'caseId' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Secret Token</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-lg font-mono text-brand-dark select-all">
                  {result.token}
                </code>
                <button 
                  onClick={() => copyToClipboard(result.token, 'token')} 
                  className="p-3 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Copy Secret Token"
                >
                  {copiedField === 'token' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 space-y-3">
            <Link to={`/track?case=${result.caseId}`} className="btn-primary w-full inline-flex items-center justify-center gap-2 group">
              Proceed to Status Tracker
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => { setResult(null); setError(null); }} 
              className="w-full px-6 py-3 text-gray-500 hover:text-brand-dark hover:bg-gray-100 rounded-xl transition-all text-sm font-medium border border-transparent"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 animate-fade-in relative z-10">
      <div className="mb-8 flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 shrink-0">
          <FileText size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">File an Encrypted Report</h1>
          <p className="text-gray-600 mt-1">No login required. Your connection is fully encrypted.</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-800 shadow-inner">
        <Lock size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>End-to-End Protection Enabled.</strong> We do not log IP addresses or browser fingerprints.
          All communications pass through a secure tunnel and are cryptographically hashed.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-10 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-2">Category <span className="text-red-500">*</span></label>
          <select name="category" required className="glass-input cursor-pointer">
            <option value="">Select a category...</option>
            <option value="Sexual Harassment">Sexual Harassment</option>
            <option value="Ragging">Ragging</option>
            <option value="Bullying">Bullying / Cyberbullying</option>
            <option value="Discrimination">Discrimination</option>
            <option value="Safety Hazard">Campus Safety Hazard</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-2">Incident Details <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-500 mb-3">Provide as much detail as possible. Our AI engine will analyze this to prioritize emergency response.</p>
          <textarea 
            name="description" 
            required 
            rows="6" 
            className="glass-input resize-y"
            placeholder="Describe the incident in detail — what happened, when, where, and who was involved..."
          ></textarea>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Location (Optional)</label>
            <input 
              type="text" 
              name="location" 
              className="glass-input" 
              placeholder="e.g. Hostel Block C, 2nd floor" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">Date of Incident (Optional)</label>
            <input 
              type="date" 
              name="incident_date" 
              className="glass-input" 
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-6 text-center hover:bg-gray-100 transition-colors">
          <Upload className="mx-auto text-gray-400 mb-3" size={28} />
          <label className="block text-sm font-semibold text-brand-dark mb-2 cursor-pointer">
            Evidence Vault (Upload Files)
            <input 
              type="file" 
              name="files" 
              multiple 
              accept=".pdf,.png,.jpg,.jpeg,.mp4,.m4a"
              className="hidden" 
              onChange={(e) => {
                const el = document.getElementById('file-count');
                if (el) el.innerText = e.target.files.length > 0 ? `${e.target.files.length} file(s) selected` : 'No files selected';
              }}
            />
            <div className="mt-2 inline-block px-4 py-2 bg-white border border-gray-300 rounded-lg text-brand-primary text-xs font-mono hover:bg-gray-50 transition-colors">
              Browse Files
            </div>
          </label>
          <p id="file-count" className="text-xs text-gray-500 mt-2">Max 5 files (Images, PDFs, Audio, Video)</p>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
          >
            {loading && (
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            )}
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <Lock size={20} className="animate-pulse" />
                Encrypting & Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Report Securely
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
