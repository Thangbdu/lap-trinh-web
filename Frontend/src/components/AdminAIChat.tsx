import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Plus, Trash2, Save, RotateCcw, Sparkles, Send, Link as LinkIcon, Pencil, Check, X as CloseIcon } from 'lucide-react';

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

export default function AdminAIChat() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [newAction, setNewAction] = useState({ label: '', path: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ai_assistant_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrating old string format if exists
        if (parsed.quickActions && typeof parsed.quickActions[0] === 'string') {
          parsed.quickActions = parsed.quickActions.map((s: string) => ({ label: s, path: '' }));
        }
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to load AI config', e);
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('ai_assistant_config', JSON.stringify(config));
      setIsSaving(false);
      showToast('✅ Đã lưu cấu hình trợ lý AI!');
      window.dispatchEvent(new Event('ai_config_updated'));
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn khôi phục về mặc định?')) {
      setConfig(DEFAULT_CONFIG);
      setEditingIndex(null);
      setNewAction({ label: '', path: '' });
      showToast('🔄 Đã khôi phục cài đặt gốc');
    }
  };

  const addAction = () => {
    if (!newAction.label.trim()) return;

    if (editingIndex !== null) {
      const updated = [...config.quickActions];
      updated[editingIndex] = { ...newAction };
      setConfig({ ...config, quickActions: updated });
      setEditingIndex(null);
    } else {
      setConfig({ ...config, quickActions: [...config.quickActions, { ...newAction }] });
    }
    setNewAction({ label: '', path: '' });
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setNewAction(config.quickActions[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewAction({ label: '', path: '' });
  };

  const removeAction = (index: number) => {
    const updated = config.quickActions.filter((_, i) => i !== index);
    setConfig({ ...config, quickActions: updated });
    if (editingIndex === index) cancelEdit();
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500 font-display">
      {toast && (
        <div className="fixed bottom-10 right-10 z-[1000] bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles size={18} />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] rounded-3xl p-8 shadow-2xl border border-[#334155]">
            <div className="flex items-center gap-3 mb-8 border-b border-[#334155] pb-4">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cấu hình chung</h2>
                <p className="text-sm text-slate-400">Thiết lập danh tính và lời chào của trợ lý</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tên trợ lý</label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    placeholder="VD: MobileStore Assistant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Trạng thái hoạt động</label>
                  <div className="flex items-center gap-4 h-[50px]">
                    <button
                      onClick={() => setConfig({ ...config, isActive: !config.isActive })}
                      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${config.isActive ? 'bg-primary' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${config.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-bold ${config.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                      {config.isActive ? 'Đang hoạt động' : 'Đã tạm dừng'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Lời chào ban đầu</label>
                <textarea
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                  className="w-full bg-[#0f172a] border border-[#334155] rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none h-24 resize-none"
                  placeholder="Nhập lời chào khách hàng khi mở khung chat..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Quản lý câu hỏi nhanh & Chuyển hướng</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <input
                    type="text"
                    value={newAction.label}
                    onChange={(e) => setNewAction({ ...newAction, label: e.target.value })}
                    placeholder="Tên câu hỏi (VD: Xem iPhone)"
                    className="bg-[#0f172a] border border-[#334155] rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAction.path}
                      onChange={(e) => setNewAction({ ...newAction, path: e.target.value })}
                      placeholder="Đường dẫn (VD: /product/1)"
                      className="flex-1 bg-[#0f172a] border border-[#334155] rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    />
                    <button
                      onClick={addAction}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white hover:brightness-110 active:scale-95 transition-all shadow-lg ${editingIndex !== null ? 'bg-green-500 shadow-green-500/20' : 'bg-primary shadow-primary/20'}`}
                    >
                      {editingIndex !== null ? <Check size={24} /> : <Plus size={24} />}
                    </button>
                    {editingIndex !== null && (
                      <button
                        onClick={cancelEdit}
                        className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-slate-300 hover:bg-slate-600 active:scale-95 transition-all"
                      >
                        <CloseIcon size={24} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.quickActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="group flex flex-col gap-1 bg-[#0f172a] border border-[#334155] rounded-2xl p-4 hover:border-primary/50 transition-all relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-200">{action.label}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(idx)}
                            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeAction(idx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <LinkIcon size={12} />
                        <span className="truncate">{action.path || 'Không có chuyển hướng'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-10 pt-8 border-t border-[#334155]">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-primary/20"
              >
                {isSaving ? <RotateCcw className="animate-spin" size={20} /> : <Save size={20} />}
                Lưu cấu hình
              </button>
              <button
                onClick={handleReset}
                className="px-6 bg-slate-800 text-slate-400 font-bold py-4 rounded-2xl border border-[#334155] hover:bg-slate-700 hover:text-white transition-all active:scale-95"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-[#334155] sticky top-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" /> Demo thực tế
            </h3>
            
            <div className="w-full h-[520px] bg-slate-900 rounded-[2rem] overflow-hidden border border-[#334155] flex flex-col shadow-inner relative">
              {!config.isActive && (
                <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                  <Bot size={40} className="text-slate-600 mb-4" />
                  <h4 className="font-bold text-white mb-2">Trợ lý đang ẩn</h4>
                  <p className="text-xs text-slate-400">Khách hàng sẽ không thấy khung chat.</p>
                </div>
              )}
              
              <div className="p-4 bg-gradient-to-r from-[#4B0082] to-[#6A5ACD] text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/20 shadow-inner">
                  <img src={config.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-none">{config.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] text-white/70">Sẵn sàng hỗ trợ</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-950/40">
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-3 text-xs text-slate-800 shadow-sm leading-relaxed">
                    {config.greeting}
                  </div>
                </div>
              </div>

              <div className="p-3 flex gap-2 overflow-x-auto scrollbar-hide bg-slate-950/40 border-t border-white/5">
                {config.quickActions.map((a, i) => (
                  <div key={i} className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#334155] rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {a.label}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-900 border-t border-[#334155]">
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-slate-800 rounded-2xl px-4 flex items-center text-[11px] text-slate-500">
                    Hỏi tôi bất cứ điều gì...
                  </div>
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <Send size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
