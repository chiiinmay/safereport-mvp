import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, AlertCircle, CheckCircle2, Copy, Check, FileText, ArrowRight, Upload, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';

export default function Submit() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [selectedFileCount, setSelectedFileCount] = useState(0);
  const { t } = useLang();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.target);
    
    // Attempt to capture GPS coordinates for audit/validation
    let coords = 'Unknown';
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
    } catch (err) {
      console.warn("Could not retrieve GPS coordinates:", err);
    }
    formData.append('coordinates', coords);

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
      <motion.div
        className="max-w-2xl mx-auto mt-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="glass-card p-6 sm:p-8 md:p-10 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('submit.successTitle')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">{t('submit.successDesc')}</p>
          
          {result.threatScore > 50 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm mt-4">
              <span className="font-bold">⚠️ {t('submit.highPriority')}</span> {t('submit.highPriorityDesc')}
            </div>
          )}
          
          <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-200 shadow-sm mt-6 space-y-5 text-left">
            <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-semibold">
                {t('submit.credentialsWarning')}
              </p>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('submit.caseIdLabel')}</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 text-base sm:text-lg font-mono text-brand-dark select-all">
                  {result.caseId}
                </code>
                <button 
                  onClick={() => copyToClipboard(result.caseId, 'caseId')} 
                  className="p-3 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Copy Case ID"
                >
                  {copiedField === 'caseId' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{t('submit.tokenLabel')}</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 text-base sm:text-lg font-mono text-brand-dark select-all">
                  {result.token}
                </code>
                <button 
                  onClick={() => copyToClipboard(result.token, 'token')} 
                  className="p-3 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Copy Secret Token"
                >
                  {copiedField === 'token' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <Link to={`/track?case=${result.caseId}`} className="btn-primary w-full inline-flex items-center justify-center gap-2 group">
              {t('submit.proceedTracker')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => { setResult(null); setError(null); setSelectedFileCount(0); }} 
              className="w-full px-6 py-3 text-slate-500 hover:text-brand-dark hover:bg-slate-100 rounded-xl transition-all text-sm font-medium"
            >
              {t('submit.submitAnother')}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-4 relative z-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('submit.title')}
          </h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">{t('submit.subtitle')}</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3 text-blue-800">
        <Lock size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm">
          <strong>{t('submit.securityTitle')}</strong> {t('submit.securityDesc')}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-6 md:p-8 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-2">
            {t('submit.categoryLabel')} <span className="text-red-500">*</span>
          </label>
          <select name="category" required className="glass-input cursor-pointer">
            <option value="">{t('submit.categoryPlaceholder')}</option>
            <option value="Sexual Harassment">{t('submit.catSexualHarassment')}</option>
            <option value="Ragging">{t('submit.catRagging')}</option>
            <option value="Bullying">{t('submit.catBullying')}</option>
            <option value="Discrimination">{t('submit.catDiscrimination')}</option>
            <option value="Safety Hazard">{t('submit.catSafety')}</option>
            <option value="Other">{t('submit.catOther')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-dark mb-2">
            {t('submit.detailsLabel')} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">{t('submit.detailsHint')}</p>
          <textarea 
            name="description" 
            required 
            rows="6" 
            className="glass-input resize-y"
            placeholder={t('submit.detailsPlaceholder')}
          ></textarea>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">{t('submit.locationLabel')}</label>
            <input 
              type="text" 
              name="location" 
              className="glass-input" 
              placeholder={t('submit.locationPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-2">{t('submit.dateLabel')}</label>
            <input 
              type="date" 
              name="incident_date" 
              className="glass-input" 
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-5 text-center hover:bg-slate-100 transition-colors">
          <Upload className="mx-auto text-slate-400 mb-2" size={24} />
          <label className="block text-sm font-semibold text-brand-dark mb-2 cursor-pointer">
            {t('submit.uploadTitle')}
            <input 
              type="file" 
              name="files" 
              multiple 
              accept=".pdf,.png,.jpg,.jpeg,.mp4,.m4a"
              className="hidden" 
              onChange={(e) => {
                setSelectedFileCount(e.target.files.length);
              }}
            />
            <div className="mt-2 inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg text-brand-primary text-xs font-mono hover:bg-slate-50 transition-colors">
              {t('submit.uploadBrowse')}
            </div>
          </label>
          <p className="text-xs text-slate-500 mt-2">
            {selectedFileCount > 0 
              ? `${selectedFileCount} ${t('submit.filesSelected')}` 
              : t('submit.uploadHint')}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('submit.submitting')}
              </>
            ) : (
              <>
                <Send size={18} />
                {t('submit.submitBtn')}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
