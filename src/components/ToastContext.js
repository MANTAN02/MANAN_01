import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            marginBottom: 12,
            padding: '12px 24px',
            borderRadius: 8,
            background: toast.type === 'success' ? '#22a06b' : toast.type === 'error' ? '#c00' : '#232F3E',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            minWidth: 200
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
} 