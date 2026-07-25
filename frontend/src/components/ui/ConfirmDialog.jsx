import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="glass-card max-w-sm w-full p-6 rounded-2xl shadow-2xl relative border border-border-glass" style={{ animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center border border-error/20 flex-shrink-0 mt-1">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
          <div>
            <h3 className="font-display-lg text-title-lg text-on-surface mb-1">{title}</h3>
            <p className="text-on-surface-variant font-body-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-on-surface-variant font-label-sm hover:bg-surface-glass transition-colors border border-transparent hover:border-border-glass"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-error text-on-error font-label-sm font-bold shadow-lg shadow-error/20 hover:bg-error-container transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
