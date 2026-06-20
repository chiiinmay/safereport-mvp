import { useState } from 'react';
import { MessageCircle, Send, Smartphone, ScanLine, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function WhatsAppMock() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to the SafeReport WhatsApp Bot. Reply "REPORT" to start an anonymous submission.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const currentInput = input.trim();
    setInput('');

    setTimeout(() => {
      let reply = '';
      if (currentInput.toUpperCase() === 'REPORT') {
        reply = 'Please select a category:\n1. Sexual Harassment\n2. Ragging\n3. Bullying\n4. Other\n\nReply with the number.';
      } else if (['1', '2', '3', '4'].includes(currentInput)) {
        reply = 'Please type a description of the incident. Note: We will not link your phone number to this case.';
      } else if (currentInput.length > 10) {
        reply = `Report Submitted! Your Case ID is: SR-${Math.floor(Math.random()*10000)}.\n\nYou can track this on the web portal. Reply "STATUS" to check updates here.`;
      } else {
        reply = 'I did not understand that. Reply "REPORT" to file a case, or "STATUS" to check an existing case.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 1500);
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-4 relative z-10 flex flex-col md:flex-row gap-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Left side: Instructions */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#25D366]/15 border-2 border-[#25D366]/50 rounded-2xl flex items-center justify-center text-[#25D366]">
            <MessageCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark" style={{ fontFamily: 'var(--font-heading)' }}>WhatsApp Bot Integration</h1>
            <p className="text-[#25D366] font-medium mt-1 uppercase tracking-widest text-xs">Official Integration Demo</p>
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8">
          <h3 className="text-lg font-bold text-brand-dark mb-4" style={{ fontFamily: 'var(--font-heading)' }}>How it works</h3>
          <ul className="space-y-4 text-slate-600">
            <li className="flex items-start gap-3">
              <ScanLine className="text-[#25D366] shrink-0 mt-1" size={20} />
              <span className="text-sm leading-relaxed">Students scan a QR code placed around campus (bathrooms, notice boards) to instantly open a WhatsApp chat.</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="text-[#25D366] shrink-0 mt-1" size={20} />
              <span className="text-sm leading-relaxed"><strong>Privacy First:</strong> The Twilio/WhatsApp integration strips the phone number before saving to our database. Total anonymity is preserved.</span>
            </li>
            <li className="flex items-start gap-3">
              <Smartphone className="text-[#25D366] shrink-0 mt-1" size={20} />
              <span className="text-sm leading-relaxed">Report incidents via simple conversational text, without needing to download a separate app.</span>
            </li>
          </ul>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-slate-400 text-xs mb-2">Scan to test (Mockup)</p>
            <div className="w-40 h-40 bg-white mx-auto rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden p-2">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/917259318926?text=REPORT" 
                alt="WhatsApp QR Code" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Mock Phone UI */}
      <div className="w-[320px] sm:w-[340px] mx-auto md:mx-0 shrink-0 h-[640px] sm:h-[680px] bg-slate-950 rounded-[36px] border-[6px] border-slate-800 shadow-xl overflow-hidden relative flex flex-col">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-20"></div>
        
        {/* WA Header */}
        <div className="bg-[#075E54] pt-9 pb-3 px-4 flex items-center gap-3 z-10 shadow-sm">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">SafeReport Bot ✅</h3>
            <p className="text-white/70 text-xs">online</p>
          </div>
        </div>

        {/* WA Chat Area */}
        <div className="flex-1 bg-[#E5DDD5] bg-[url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] bg-cover p-3 overflow-y-auto space-y-2.5 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex max-w-[85%]", m.role === 'user' ? "ml-auto justify-end" : "mr-auto")}>
              <div className={cn(
                "p-2 px-3 rounded-lg text-sm shadow-sm relative",
                m.role === 'user' ? "bg-[#DCF8C6] text-gray-800 rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
              )}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span className="text-[10px] text-gray-400 float-right mt-1 ml-2">Now</span>
              </div>
            </div>
          ))}
        </div>

        {/* WA Input */}
        <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 border-t border-gray-300">
          <form onSubmit={handleSend} className="flex-1 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Message" 
              className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none text-gray-800"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 bg-[#128C7E] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm disabled:opacity-50"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
