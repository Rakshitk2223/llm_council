import { useState, useEffect, useCallback } from 'react';

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

// Global toast state
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
  
  // Keep max 3 toasts
  if (toasts.length >= 3) {
    toasts = toasts.slice(1);
  }
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto remove
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
    // Initial sync
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

// Toast component
export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  const getTypeStyles = (type: Toast['type']) => {
    switch (type) {
      case 'error':
        return 'border-l-4 border-l-error bg-error/10';
      case 'warning':
        return 'border-l-4 border-l-warning bg-warning/10';
      case 'success':
        return 'border-l-4 border-l-success bg-success/10';
      case 'info':
      default:
        return 'border-l-4 border-l-primary bg-primary/10';
    }
  };
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`
            ${getTypeStyles(toast.type)}
            bg-surface-elevated/95
            backdrop-blur-sm
            text-text-primary
            px-6 py-4
            rounded-lg
            shadow-lg
            border border-border
            min-w-[300px]
            max-w-[500px]
            animate-slide-down
            flex items-center justify-between gap-4
          `}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// CSS for animation
export const toastStyles = `
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slide-down {
    animation: slide-down 0.3s ease-out forwards;
  }
`;
