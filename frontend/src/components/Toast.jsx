import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Toast = () => {
  const { toast, clearToast } = useAuth();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed z-[99999] animate-slide-in" style={{ bottom: '20px', right: '20px' }}>
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-300 ${
        isSuccess 
          ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-300' 
          : 'border-rose-500/30 bg-rose-950/80 text-rose-300'
      }`}>
        {isSuccess ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-rose-400" />}
        <span className="text-sm font-medium">{toast.message}</span>
        <button 
          onClick={clearToast} 
          className="ml-2 rounded-full p-0.5 hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
