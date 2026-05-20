// src/components/ui/PreviewModal.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ open, onClose, title = 'Preview', children }) => {
  // Fecha com Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{ height: '80dvh' }}>
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-sm font-semibold text-slate-700 mt-1">{title}</span>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-h-0 p-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
