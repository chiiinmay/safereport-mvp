import { Link } from 'react-router-dom';
import { ShieldAlert, Activity, FileText, LockKeyhole, ShieldCheck, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 relative">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -right-20 w-72 h-72 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse [animation-delay:1s]" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-semibold text-sm mb-4 border border-brand-primary/20">
            <ShieldAlert size={16} />
            DSATM Official Safety Portal
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Speak Up, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">Stay Safe.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The fully anonymous, encrypted platform for reporting harassment, ragging, and safety concerns at <strong>Dayananda Sagar Academy of Technology &amp; Management</strong>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/submit" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center gap-2 group">
              <FileText size={20} />
              File an Anonymous Report
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/track" className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-brand-dark bg-white border-2 border-gray-200 rounded-xl hover:border-brand-primary/30 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md">
              <Activity size={20} />
              Track Existing Case
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {[
          { value: '100%', label: 'Anonymous', icon: EyeOff },
          { value: 'AES-256', label: 'Encrypted', icon: LockKeyhole },
          { value: '24/7', label: 'Available', icon: Zap },
          { value: 'UGC', label: 'Compliant', icon: ShieldCheck },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5 text-center group hover:scale-105 transition-transform duration-300">
            <stat.icon size={20} className="mx-auto mb-2 text-brand-secondary" />
            <p className="text-2xl font-extrabold text-brand-dark">{stat.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-dark">How It Works</h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">Three simple steps to file and track your anonymous report.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 space-y-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Submit Anonymously</h3>
              <p className="text-gray-600 leading-relaxed">
                No login. No IP tracking. No personal data collected. Select a category, describe what happened, and submit securely.
              </p>
            </div>
          </div>
          <div className="glass-card p-8 space-y-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Get Your Credentials</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive a unique Case ID and Secret Token. Save them — they're your only way to track your report and chat with the committee.
              </p>
            </div>
          </div>
          <div className="glass-card p-8 space-y-4 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-full -mr-4 -mt-4 pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark">Track &amp; Communicate</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your case status in real-time. Use the anonymous two-way chat to exchange information with the Anti-Ragging/ICC Committee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section className="glass-card p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center text-white shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-brand-dark">Built for Regulatory Compliance</h3>
            <p className="text-gray-600 leading-relaxed">
              SafeReport is designed to meet the requirements of UGC anti-ragging regulations, the POSH Act 2013, 
              POCSO Act 2012 (for minors), and the Digital Personal Data Protection (DPDP) Act 2023.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['UGC/ICC-POSH', 'POSH Act 2013', 'POCSO Act 2012', 'DPDP Act 2023'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary rounded-lg border border-brand-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center max-w-2xl mx-auto space-y-6 pb-8">
        <h2 className="text-3xl font-bold text-brand-dark">Your Voice Matters</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Every report helps make DSATM a safer campus. You don't need to reveal who you are to make a difference.
        </p>
        <Link to="/submit" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4 group">
          <FileText size={20} />
          File a Report Now
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
