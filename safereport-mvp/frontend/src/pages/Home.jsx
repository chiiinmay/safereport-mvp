import { Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, LockKeyhole, Zap, FileText, ArrowRight, Activity, Send, Search, CheckCircle, Users, MessageSquare, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: 'easeOut' },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, margin: '-60px' },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export default function Home() {
  const { lang, t } = useLang();

  const stats = [
    { value: t('home.stat1Value'), label: t('home.stat1Label'), icon: EyeOff },
    { value: t('home.stat2Value'), label: t('home.stat2Label'), icon: LockKeyhole },
    { value: t('home.stat3Value'), label: t('home.stat3Label'), icon: Zap },
    { value: t('home.stat4Value'), label: t('home.stat4Label'), icon: ShieldCheck },
  ];

  const desktopSteps = [
    {
      step: 1,
      title: t('home.step1Title'),
      icon: Send,
      desc: t('home.step1Desc'),
      color: 'bg-blue-50 text-brand-primary border-blue-200',
      iconBg: 'bg-brand-primary',
    },
    {
      step: 2,
      title: t('home.step2Title'),
      icon: Search,
      desc: t('home.step2Desc'),
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-500',
    },
    {
      step: 3,
      title: t('home.step3Title'),
      icon: CheckCircle,
      desc: t('home.step3Desc'),
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-600',
    },
  ];

  const mobileSteps = [
    {
      step: 1,
      title: t('home.step1Title'),
      icon: Send,
      desc: t('home.step1DescShort'),
      iconBg: 'bg-brand-primary',
    },
    {
      step: 2,
      title: t('home.step2Title'),
      icon: Search,
      desc: t('home.step2DescShort'),
      iconBg: 'bg-amber-500',
    },
    {
      step: 3,
      title: t('home.step3Title'),
      icon: CheckCircle,
      desc: t('home.step3DescShort'),
      iconBg: 'bg-emerald-600',
    },
  ];

  const faqs = [
    {
      icon: EyeOff,
      question: t('home.faq1Q'),
      answer: t('home.faq1A'),
    },
    {
      icon: Users,
      question: t('home.faq2Q'),
      answer: t('home.faq2A'),
    },
    {
      icon: Activity,
      question: t('home.faq3Q'),
      answer: t('home.faq3A'),
    },
    {
      icon: MessageSquare,
      question: t('home.faq4Q'),
      answer: t('home.faq4A'),
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-20 py-4 sm:py-8">
      {/* ─── ANONYMITY HERO (above the fold) ─── */}
      <motion.section
        className="text-center max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/8 text-brand-primary font-semibold text-xs border border-brand-primary/15">
          <ShieldAlert size={14} />
          {t('home.badge')}
        </div>

        {/* Anonymity guarantee — THE most prominent element */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 relative">
            {/* Soft ambient glow behind the shield */}
            <div className="absolute inset-1 bg-brand-primary/6 rounded-3xl blur-xl" />
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full relative z-10" style={{ filter: 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.12))' }}>
              <defs>
                <linearGradient id="shieldGrad" x1="24" y1="10" x2="56" y2="70" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="shieldHighlight" x1="40" y1="10" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Shield body */}
              <path d="M40 8L14 20v18c0 17.6 11.08 33.06 26 37 14.92-3.94 26-19.4 26-37V20L40 8z" fill="url(#shieldGrad)" />
              {/* Top-edge highlight for sculpted feel */}
              <path d="M40 8L14 20v18c0 17.6 11.08 33.06 26 37 14.92-3.94 26-19.4 26-37V20L40 8z" fill="url(#shieldHighlight)" />
              {/* Eye shape — anonymity symbol */}
              <ellipse cx="40" cy="40" rx="13" ry="8" stroke="white" strokeWidth="2.2" fill="none" opacity="0.9" />
              <circle cx="40" cy="40" r="3.5" fill="white" opacity="0.9" />
              {/* Slash line — eye-off = hidden identity */}
              <line x1="28" y1="50" x2="52" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-dark tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {t('home.heroTitle1')}{' '}
            <span className="text-brand-primary">{t('home.heroTitle2')}</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroDesc')}{' '}
            <strong className="text-brand-dark">{t('home.college')}</strong>
            {t('home.heroDescEnd')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to="/submit" className="btn-primary w-full sm:w-auto text-base px-6 py-3.5 flex items-center justify-center gap-2 group">
            <FileText size={18} />
            {t('home.ctaFile')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/track" className="w-full sm:w-auto px-6 py-3.5 text-base font-medium text-brand-dark bg-white border border-slate-200 rounded-xl hover:border-brand-primary/30 hover:bg-slate-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
            <Activity size={18} />
            {t('home.ctaTrack')}
          </Link>
        </div>
      </motion.section>

      {/* ─── TRUST STATS BAR ─── */}
      <motion.section {...fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <stat.icon size={18} className="mx-auto mb-2 text-brand-primary" />
            <p className="text-xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{stat.value}</p>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.section>

      {/* ─── HOW IT WORKS — Visual Flow ─── */}
      <motion.section {...fadeUp} className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.howTitle')}</h2>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm sm:text-base">{t('home.howDesc')}</p>
        </div>

        {/* Desktop: horizontal flow with connectors | Mobile: vertical timeline */}
        <div className="hidden md:flex items-start justify-between gap-0">
          {desktopSteps.map((item, idx) => (
            <div key={item.step} className="flex items-start flex-1">
              <motion.div
                className="flex flex-col items-center text-center px-4"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center text-white mb-4 step-icon`}>
                  <item.icon size={24} />
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-3 ${item.color}`}>
                  {lang === 'hi' ? `चरण ${item.step}` : `Step ${item.step}`} — {item.title}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed max-w-[240px]">{item.desc}</p>
              </motion.div>
              {idx < 2 && (
                <div className="flex items-center pt-7 flex-shrink-0">
                  <div className="w-12 lg:w-20 h-px border-t-2 border-dashed border-slate-300"></div>
                  <ArrowRight size={16} className="text-slate-400 -ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-0">
          {mobileSteps.map((item, idx) => (
            <motion.div
              key={item.step}
              className="flex gap-4"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              {/* Timeline line + circle */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-white flex-shrink-0 step-icon`}>
                  <item.icon size={18} />
                </div>
                {idx < 2 && <div className="w-px h-full min-h-[48px] border-l-2 border-dashed border-slate-200 mt-2"></div>}
              </div>
              <div className="pb-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {lang === 'hi' ? `चरण ${item.step}` : `Step ${item.step}`}
                </p>
                <h3 className="text-base font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ─── TRUST & REASSURANCE SECTION ─── */}
      <motion.section {...fadeUp} className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.trustTitle')}</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">{t('home.trustDesc')}</p>
        </div>

        <motion.div {...staggerContainer} className="grid sm:grid-cols-2 gap-4">
          {faqs.map((item) => (
            <motion.div
              key={item.question}
              {...staggerItem}
              className="glass-card p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <item.icon size={18} className="text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-dark text-base" style={{ fontFamily: 'var(--font-heading)' }}>{item.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1.5">{item.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ─── COMPLIANCE SECTION ─── */}
      <motion.section {...fadeUp} className="glass-card p-6 sm:p-8 md:p-10 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="flex-shrink-0 w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center text-white step-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.complianceTitle')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('home.complianceDesc')}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {['UGC/ICC-POSH', 'POSH Act 2013', 'POCSO Act 2012', 'DPDP Act 2023'].map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-brand-primary/8 text-brand-primary rounded-lg border border-brand-primary/15">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA SECTION ─── */}
      <motion.section {...fadeUp} className="text-center max-w-2xl mx-auto space-y-5 pb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>{t('home.voiceTitle')}</h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          {t('home.voiceDesc')}
        </p>
        <Link to="/submit" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5 group">
          <FileText size={18} />
          {t('home.voiceCta')}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.section>
    </div>
  );
}
