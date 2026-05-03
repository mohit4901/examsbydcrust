import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const FormattedText = ({ text }) => {
  if (!text) return null;
  
  // Split by newlines and handle basic markdown
  const lines = text.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        // Handle headers/bold titles
        if (line.startsWith('**') && line.endsWith('**')) {
          return <h4 key={i} className="text-white font-black mt-4 mb-2 uppercase tracking-wider text-xs">{line.replace(/\*\*/g, '')}</h4>;
        }
        
        // Handle bullet points
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <div className="w-1.5 h-1.5 bg-white/40 rounded-full mt-1.5 shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed">
                {line.trim().substring(2).split('**').map((part, j) => 
                  j % 2 === 1 ? <b key={j} className="text-white font-bold">{part}</b> : part
                )}
              </p>
            </div>
          );
        }

        // Handle normal lines with bold parts
        return (
          <p key={i} className="text-sm text-gray-300 leading-relaxed min-h-[1em]">
            {line.split('**').map((part, j) => 
              j % 2 === 1 ? <b key={j} className="text-white font-bold">{part}</b> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your DCRUST Exam Sage. How can I help you with your studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/ai/chat`, { 
        message: userMessage,
        context: `User: ${user?.name}, Branch: ${user?.branch}, Sem: ${user?.semester}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my reasoning core. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] md:w-[450px] h-[600px] bg-[#1a1a1a] border border-white/10 rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-white text-black flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="font-black text-sm uppercase tracking-widest block">Exam Sage</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 italic">Llama 3.3 Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[24px] shadow-xl ${
                    msg.role === 'user' 
                      ? 'bg-white text-black font-bold text-sm rounded-tr-none' 
                      : 'bg-[#252525] text-gray-300 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <FormattedText text={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#252525] p-5 rounded-[24px] border border-white/5 animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 bg-[#1a1a1a] border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Mohit about Waterfall model..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-white/30 text-white placeholder:text-white/20"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        <div className="absolute -top-12 right-0 bg-white text-black px-4 py-2 rounded-xl text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Talk to Exam Sage
        </div>
      </motion.button>
    </div>
  );
};

export default AIAssistant;
