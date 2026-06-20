import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, X, Send, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n/LanguageContext';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AIAssistant() {
  const { lang, t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Initialize messages from localStorage or default translation greeting
  useEffect(() => {
    const saved = localStorage.getItem('safereport_ai_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([
        { role: 'ai', text: t('ai.greeting') }
      ]);
    }
  }, []);

  // Sync greeting translation if language changes and no user messages exist yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'ai') {
        const isEnglishGreeting = prev[0].text === "Hello. I am the SafeReport AI Guardian. I can help you categorize your report or guide you on what evidence is best to provide. How can I assist you today?";
        const isHindiGreeting = prev[0].text === "नमस्ते। मैं सेफरिपोर्ट AI गार्डियन हूँ। मैं आपकी रिपोर्ट को श्रेणीबद्ध करने या सर्वोत्तम सबूत प्रदान करने में आपकी मदद कर सकता हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?";
        if (isEnglishGreeting || isHindiGreeting) {
          return [{ role: 'ai', text: t('ai.greeting') }];
        }
      }
      return prev;
    });
  }, [lang]);

  // Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('safereport_ai_chat', JSON.stringify(messages));
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const speak = (text) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.9;
    utterance.rate = 1;
    
    // Choose appropriate voice language
    const voices = window.speechSynthesis.getVoices();
    const selectedLang = lang === 'hi' ? 'hi-IN' : 'en-US';
    const voice = voices.find(v => v.lang.includes(selectedLang));
    if (voice) utterance.voice = voice;
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');

    // Mock AI Response Engine supporting Hindi keyword matches
    setTimeout(() => {
      let aiResponse = t('ai.defaultReply');
      const lower = text.toLowerCase();
      
      if (lower.includes('ragging') || lower.includes('seniors') || lower.includes('रैगिंग') || lower.includes('सीनियर')) {
        aiResponse = t('ai.raggingReply');
      } else if (lower.includes('harassment') || lower.includes('touch') || lower.includes('उत्पीड़न') || lower.includes('परेशान')) {
        aiResponse = t('ai.harassmentReply');
      } else if (lower.includes('proof') || lower.includes('evidence') || lower.includes('सबूत') || lower.includes('प्रूफ')) {
        aiResponse = t('ai.evidenceReply');
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('नमस्ते') || lower.includes('हेलो')) {
        aiResponse = t('ai.helloReply');
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      speak(aiResponse);
    }, 1000);
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert(t('ai.voiceError'));
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.start();
      setIsRecording(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 bg-slate-800 border border-slate-600 rounded-full flex flex-col items-center justify-center text-brand-secondary shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-200 group"
        aria-label="Open AI assistant"
      >
        <Bot size={22} className="group-hover:scale-110 transition-transform" />
        <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-slate-300">
          {t('ai.btnLabel')}
        </span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-24 left-6 z-50 w-[340px] h-[480px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-secondary border border-brand-secondary/30">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{t('ai.title')}</h3>
              <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse"></span> {t('ai.online')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-slate-400 hover:text-white transition-colors">
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex flex-col max-w-[85%]", m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                m.role === 'user' 
                  ? "bg-brand-primary text-white rounded-tr-none" 
                  : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none leading-relaxed"
              )}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-end gap-2">
          <button 
            onClick={toggleRecording}
            className={cn(
              "p-3 rounded-xl transition-colors flex-shrink-0",
              isRecording ? "bg-red-500/20 text-red-500 animate-pulse border border-red-500/50" : "bg-slate-700 text-brand-accent hover:bg-slate-600 border border-transparent"
            )}
          >
            <Mic size={20} />
          </button>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex-1 flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary/30 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.placeholder')}
              className="flex-1 px-4 py-3 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="px-4 text-brand-primary hover:text-brand-secondary disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
