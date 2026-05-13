import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border backdrop-blur-md min-w-[320px] max-w-[420px] ${
                toast.type === 'success' 
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100'
                  : toast.type === 'error'
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-800/50 text-rose-900 dark:text-rose-100'
                  : 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-800/50 text-blue-900 dark:text-blue-100'
              }`}
            >
              <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${
                toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-600' :
                toast.type === 'error' ? 'bg-rose-500/20 text-rose-600' :
                'bg-blue-500/20 text-blue-600'
              }`}>
                {toast.type === 'success' && <CheckCircle className="size-6" />}
                {toast.type === 'error' && <XCircle className="size-6" />}
                {toast.type === 'info' && <Info className="size-6" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold capitalize">{toast.type}</h4>
                <p className="text-xs opacity-80 font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="shrink-0 hover:bg-black/5 dark:hover:bg-white/10 p-2 rounded-xl transition-colors"
              >
                <X className="size-4 opacity-50" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
