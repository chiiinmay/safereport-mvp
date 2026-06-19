import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, X, Send, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('safereport_ai_chat');
    if (saved) return JSON.parse(saved);
    return [
      { role: 'ai', text: "Hello. I am the SafeReport AI Guardian. I can help you categorize your report or guide you on what evidence is best to provide. How can I assist you today?" }
    ];
  });
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef(null);

  // Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    localStorage.setItem('safereport_ai_chat', JSON.stringify(messages));
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
    // Try to find an English female voice for standard AI feel
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Female'));
    if (englishVoice) utterance.voice = englishVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');

    // Mock AI Response Engine (for Hackathon)
    setTimeout(() => {
      let aiResponse = "I've recorded that securely. Is there anything else you'd like to tell me before you submit your formal report?";
      const lower = text.toLowerCase();
      
      if (lower.includes('ragging') || lower.includes('seniors')) {
        aiResponse = "I understand. Ragging is a serious offense. When submitting your report, please try to include the block number and any identifying details of the seniors involved. Your identity will remain fully hidden.";
      } else if (lower.includes('harassment') || lower.includes('touch')) {
        aiResponse = "I am so sorry you experienced this. Please use the 'Sexual Harassment' category. If you have screenshots or audio, upload them in the Evidence Vault. If you are in immediate danger, please press the red SOS button.";
      } else if (lower.includes('proof') || lower.includes('evidence')) {
        aiResponse = "You can upload up to 5 files in the Evidence Vault on the submission page. We accept PDFs, Images, Audio, and Video files. All metadata is stripped for your protection.";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        aiResponse = "Hello. Please let me know what happened, and I will guide you on how to report it safely.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      speak(aiResponse);
    }, 1000);
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = 'en-US';
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
        className="fixed bottom-6 right-28 z-40 w-14 h-14 bg-slate-800 border border-brand-secondary rounded-full flex flex-col items-center justify-center text-brand-secondary shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:scale-110 hover:bg-slate-700 transition-all duration-300 group"
      >
        <Bot size={24} className="group-hover:animate-bounce" />
        <span className="text-[9px] font-bold mt-0.5 uppercase tracking-wider">AI Help</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 sm:right-28 z-50 w-[350px] h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-[slideDown_0.3s_ease-out]">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-secondary border border-brand-secondary/50">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Guardian</h3>
            <p className="text-[10px] text-brand-secondary uppercase tracking-widest font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-pulse"></span> Online
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
          className="flex-1 flex bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-brand-secondary focus-within:ring-1 focus-within:ring-brand-secondary transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak..."
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
    </div>
  );
}
