import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'success' | 'info';
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener([...toasts]));
};

export const addToast = (
  message: string,
  type: Toast['type'] = 'info',
  duration: number = 5000
) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { id, message, type, duration };
  
  if (toasts.length >= 3) {
    toasts = toasts.slice(1);
  }
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  setTimeout(() => {
    removeToast(id);
  }, duration);
};

export const removeToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

export const useToast = () => {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    toastListeners.push(setLocalToasts);
    setLocalToasts([...toasts]);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== setLocalToasts);
    };
  }, []);
  
  return {
    toasts: localToasts,
    addToast,
    removeToast,
  };
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  const getTypeStyles = (type: Toast['type']) => {
    switch (type) {
      case 'error':
        return {
          border: 'border-l-4 border-l-status-error',
          bg: 'bg-status-error/10',
          icon: (
            <svg className="w-5 h-5 text-status-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'warning':
        return {
          border: 'border-l-4 border-l-status-warning',
          bg: 'bg-status-warning/10',
          icon: (
            <svg className="w-5 h-5 text-status-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
      case 'success':
        return {
          border: 'border-l-4 border-l-status-success',
          bg: 'bg-status-success/10',
          icon: (
            <svg className="w-5 h-5 text-status-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'info':
      default:
        return {
          border: 'border-l-4 border-l-primary',
          bg: 'bg-primary/10',
          icon: (
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
    }
  };
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3">
      {toasts.map((toast, index) => {
        const styles = getTypeStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`
              ${styles.border} ${styles.bg}
              backdrop-blur-xl
              px-5 py-4
              rounded-xl
              shadow-xl
              min-w-[320px]
              max-w-[480px]
              animate-slide-down
              flex items-center gap-3
              border border-surface-border
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {styles.icon}
            <span className="text-sm font-medium text-text-primary flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-all"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
