import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Phone, Info } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

interface QuickAction {
  label: string;
  path: string;
  state?: any;
}

interface AIConfig {
  name: string;
  greeting: string;
  quickActions: QuickAction[];
  isActive: boolean;
  avatarUrl: string;
}

const DEFAULT_CONFIG: AIConfig = {
  name: 'MobileStore AI',
  greeting: 'Xin chào! Tôi là MobileStore AI. Tôi có thể giúp gì cho bạn hôm nay?',
  quickActions: [
    { label: '🛒 Giỏ hàng', path: '/cart' },
    { label: '💳 Thanh toán', path: '/checkout' },
    { label: '📦 Đơn hàng', path: '/order-history' },
    { label: '❤️ Yêu thích', path: '/profile', state: { tab: 'wishlist' } },
    { label: '✨ Mới nhất', path: '/' },
    { label: '🏠 Trang chủ', path: '/' },
  ],
  isActive: true,
  avatarUrl: '/ai-avatar.png',
};

export default function AIChatAssistant() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConfig = () => {
    const saved = localStorage.getItem('ai_assistant_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse AI config', e);
      }
    }
  };

  useEffect(() => {
    loadConfig();
    window.addEventListener('ai_config_updated', loadConfig);
    return () => window.removeEventListener('ai_config_updated', loadConfig);
  }, []);

  useEffect(() => {
    // Reset messages with new greeting if config changes and no messages exist yet
    if (messages.length === 0 || (messages.length === 1 && messages[0].sender === 'ai')) {
      setMessages([
        {
          id: 'initial',
          text: config.greeting,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    }
  }, [config.greeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textInput: string | QuickAction) => {
    const text = typeof textInput === 'string' ? textInput : textInput.label;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Mock AI Response with "streaming" effect
    setTimeout(() => {
      let aiResponse = 'Cảm ơn bạn đã quan tâm. Tôi có thể giúp gì thêm không?';
      let shouldRedirect = '';
      
      if (typeof textInput !== 'string' && textInput.path) {
        shouldRedirect = textInput.path;
        aiResponse = `Đang chuyển bạn đến: ${textInput.label}...`;
      } else {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('đơn hàng') || lowerText.includes('kiểm tra') || lowerText.includes('lịch sử')) {
          aiResponse = 'Bạn có thể xem trạng thái đơn hàng của mình trong mục "Lịch sử mua hàng" nhé! Tôi sẽ chuyển bạn đến đó ngay.';
          shouldRedirect = '/order-history';
        } else if (lowerText.includes('samsung') || lowerText.includes('galaxy')) {
          aiResponse = 'Chúng tôi đang có rất nhiều dòng Samsung Galaxy mới nhất. Tôi sẽ dẫn bạn đến danh sách sản phẩm Samsung nhé.';
          shouldRedirect = '/?search=Samsung';
        } else if (lowerText.includes('iphone') || lowerText.includes('apple')) {
          aiResponse = 'iPhone series đang có sẵn đủ màu tại cửa hàng. Tôi sẽ chuyển bạn đến danh mục Apple.';
          shouldRedirect = '/?search=iPhone';
        } else if (lowerText.includes('bảo hành') || lowerText.includes('đổi trả')) {
          aiResponse = 'Tất cả sản phẩm tại MobileStore đều được bảo hành chính hãng. Bạn có thể xem chi tiết chính sách trong mục hỗ trợ.';
        } else if (lowerText.includes('nhân viên') || lowerText.includes('gặp người')) {
          aiResponse = 'Tôi sẽ kết nối bạn với nhân viên tư vấn ngay. Vui lòng đợi trong giây lát hoặc gọi hotline 1900 1234.';
        } else if (lowerText.includes('giỏ hàng')) {
          aiResponse = 'Đang chuyển bạn đến giỏ hàng của bạn...';
          shouldRedirect = '/cart';
        } else if (lowerText.includes('thanh toán') || lowerText.includes('mua hàng')) {
          aiResponse = 'Đang dẫn bạn đến trang thanh toán để hoàn tất đơn hàng...';
          shouldRedirect = '/checkout';
        } else if (lowerText.includes('hồ sơ') || lowerText.includes('cá nhân') || lowerText.includes('tài khoản')) {
          aiResponse = 'Đang mở trang quản lý tài khoản của bạn...';
          shouldRedirect = '/profile';
        } else if (lowerText.includes('yêu thích') || lowerText.includes('wishlist')) {
          aiResponse = 'Đang mở danh sách sản phẩm yêu thích của bạn trong hồ sơ...';
          const navState = typeof textInput !== 'string' ? textInput.state : { tab: 'wishlist' };
          navigate('/profile', { state: navState });
          setIsTyping(false);
          return;
        } else if (lowerText.includes('trang chủ') || lowerText.includes('về home') || lowerText.includes('quay lại')) {
          aiResponse = 'Đang đưa bạn về trang chủ MobileStore...';
          shouldRedirect = '/';
        } else if (lowerText.includes('mới nhất') || lowerText.includes('sản phẩm mới')) {
          aiResponse = 'Đang dẫn bạn đến danh mục sản phẩm mới nhất của chúng tôi...';
          shouldRedirect = '/';
        }
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (shouldRedirect) {
        setTimeout(() => {
          const navState = typeof textInput !== 'string' ? textInput.state : undefined;
          navigate(shouldRedirect, { state: navState });
          setIsOpen(false);
        }, 2000);
      }
    }, 1500);
  };

  if (!config.isActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-display">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[580px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#4B0082] via-[#6A5ACD] to-[#483D8B] text-white flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 overflow-hidden shadow-inner">
                    <img src="/ai-avatar.png" alt="AI Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-[#4B0082] rounded-full shadow-sm"></div>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight tracking-tight">{config.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Đang trực tuyến</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F8FAFC] dark:bg-slate-950/40 scrollbar-hide">
              <div className="flex flex-col items-center justify-center py-6 mb-2">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-3 shadow-sm border border-primary/5">
                  <Bot size={40} className="text-primary" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Trợ lý ảo thông minh</h4>
                <p className="text-xs font-medium text-slate-500 text-center px-8 leading-relaxed">
                  Tôi được huấn luyện để hỗ trợ bạn mua sắm tại MobileStore một cách tốt nhất.
                </p>
              </div>

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none shadow-[0_4px_15px_rgba(15,44,189,0.2)]'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1.5 opacity-40 text-[9px] font-medium ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'user' && <span className="material-symbols-outlined text-[10px]">done_all</span>}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-5 py-3 bg-[#F8FAFC] dark:bg-slate-950/40 flex gap-2 overflow-x-auto scrollbar-hide border-t border-slate-100 dark:border-slate-800/50">
              {config.quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(action)}
                  className="whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary hover:shadow-md transition-all active:scale-95 shadow-sm"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                    placeholder="Hỏi tôi bất cứ điều gì..."
                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isTyping}
                  className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:brightness-110 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
                >
                  <Send size={20} />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="h-px w-8 bg-slate-100 dark:bg-slate-800"></div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} className="text-secondary" /> MobileStore AI Engine
                </p>
                <div className="h-px w-8 bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <div className="relative group">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -top-16 right-0 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap mb-2 pointer-events-none"
            >
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Chat với AI ngay! 👋</p>
              <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-16 h-16 rounded-[1.75rem] shadow-[0_10px_30px_rgba(15,44,189,0.3)] flex items-center justify-center transition-all duration-500 overflow-hidden ${
            isOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 rotate-90' : 'bg-primary text-white'
          }`}
        >
          {isOpen ? (
            <X size={32} />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
              <MessageSquare size={32} fill="currentColor" className="opacity-90" />
            </>
          )}
        </motion.button>
        
        {/* No notification badge as requested */}
      </div>
    </div>
  );
}
