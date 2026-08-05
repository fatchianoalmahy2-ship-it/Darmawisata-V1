'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = 'bg-slate-900 border-slate-700 text-white';
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-400';

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-900/95 border-emerald-600 text-white shadow-emerald-950/30';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-300';
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-900/95 border-rose-600 text-white shadow-rose-950/30';
            Icon = AlertCircle;
            iconColor = 'text-rose-300';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-900/95 border-amber-600 text-white shadow-amber-950/30';
            Icon = AlertCircle;
            iconColor = 'text-amber-300';
          } else if (toast.type === 'info') {
            bgClass = 'bg-sky-900/95 border-sky-600 text-white shadow-sky-950/30';
            Icon = Info;
            iconColor = 'text-sky-300';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${bgClass}`}
            >
              <div className="flex items-center gap-2.5 text-xs font-bold leading-tight">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
