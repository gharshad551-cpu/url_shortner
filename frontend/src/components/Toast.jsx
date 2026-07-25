import { useState, useEffect } from 'react';
import { ToastContext } from '../context/ToastContextInstance';

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDone={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDone }) => {
  const [visible, setVisible] = useState(false);
  const DURATION = 4000;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, DURATION);

    return () => clearTimeout(timer);
  }, [onDone]);

  const styleMap = {
    success: {
      bg: 'bg-green-500/10 border-green-500/20 text-green-400',
      icon: 'check_circle',
      progress: 'bg-green-500/50'
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/20 text-red-400',
      icon: 'error',
      progress: 'bg-red-500/50'
    },
    info: {
      bg: 'bg-primary/10 border-primary/20 text-primary',
      icon: 'info',
      progress: 'bg-primary/50'
    }
  };

  const currentStyle = styleMap[toast.type] || styleMap.info;

  return (
    <div 
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${currentStyle.bg} bg-surface-container-lowest/80 ${
        visible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : 'opacity-0 translate-x-8 translate-y-2 scale-95'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-4 min-w-[300px]">
        <span className="material-symbols-outlined text-[20px]">{currentStyle.icon}</span>
        <span className="text-sm font-medium font-body-md text-on-surface">{toast.message}</span>
        <button 
          onClick={() => {
            setVisible(false);
            setTimeout(onDone, 300);
          }}
          className="ml-auto text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
      
      <div className="h-1 w-full bg-surface-container-high/50">
        <div 
          className={`h-full ${currentStyle.progress} origin-left`}
          style={{
            animation: visible ? `shrink ${DURATION}ms linear forwards` : 'none'
          }}
        />
      </div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};
