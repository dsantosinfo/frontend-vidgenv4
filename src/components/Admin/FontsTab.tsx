// src/components/Admin/FontsTab.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, RefreshCw, Type } from 'lucide-react';
import { listFonts, uploadFont, deleteFont } from '../../config/api';
import { LoadingSpinner, EmptyState, StatusBanner, ConfirmDialog } from '../ui';

const FontsTab: React.FC = () => {
  const [fonts, setFonts] = useState<{ name: string; path: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [confirmFont, setConfirmFont] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listFonts();
      setFonts(data.fonts ?? []);
    } catch { setFonts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadFont(file);
      flash('success', `Fonte "${file.name}" enviada com sucesso!`);
      await load();
    } catch (err: any) {
      flash('error', err.message || 'Erro ao enviar fonte.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    setConfirmFont(null);
    try {
      await deleteFont(filename);
      flash('success', 'Fonte removida.');
      await load();
    } catch (err: any) {
      flash('error', err.message || 'Erro ao remover fonte.');
    }
  };

  const customFonts = fonts.filter(f => f.type === 'custom');
  const systemFonts = fonts.filter(f => f.type === 'system');

  return (
    <div className="space-y-4">
      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {/* Upload */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-700">Upload de Fonte</p>
          <button onClick={load} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs text-slate-600 font-medium">
            {uploading ? 'Enviando...' : 'Clique para selecionar .ttf ou .otf'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Fontes ficam disponíveis globalmente para todos os usuários</p>
        </div>
        <input ref={inputRef} type="file" accept=".ttf,.otf" onChange={handleUpload} className="hidden" />
      </div>

      {/* Fontes customizadas */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">Fontes Customizadas ({customFonts.length})</span>
        </div>
        {loading ? (
          <LoadingSpinner size="sm" className="py-6" />
        ) : customFonts.length === 0 ? (
          <EmptyState icon={Type} title="Nenhuma fonte customizada." description="Faça upload de um arquivo .ttf ou .otf" />
        ) : (
          <div className="divide-y divide-slate-100">
            {customFonts.map(f => (
              <div key={f.path} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 truncate">{f.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{f.path.split('/').pop() ?? f.path}</p>
                </div>
                <button
                  onClick={() => setConfirmFont(f.path.split('/').pop() ?? f.path)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fontes do sistema (somente leitura) */}
      {systemFonts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">Fontes do Sistema ({systemFonts.length})</span>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {systemFonts.map(f => (
              <span key={f.path} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{f.name}</span>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmFont}
        title="Remover fonte"
        description={`Remover a fonte "${confirmFont}" permanentemente?`}
        confirmLabel="Remover"
        variant="danger"
        onConfirm={() => confirmFont && handleDelete(confirmFont)}
        onCancel={() => setConfirmFont(null)}
      />
    </div>
  );
};

export default FontsTab;
