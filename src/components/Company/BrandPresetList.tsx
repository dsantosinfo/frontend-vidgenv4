import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Palette, Type, Layers } from 'lucide-react';
import { getCompanyPresets, deleteCompanyPreset } from '../../config/api';
import BrandPresetEditor, { PresetType } from './BrandPresetEditor';
import { LoadingSpinner, EmptyState, ConfirmDialog } from '../ui';

interface BrandPreset {
  id: string;
  name: string;
  type: PresetType;
  config: Record<string, any>;
}

interface Props {
  companyId: string;
}

const TYPE_LABELS: Record<PresetType, string> = {
  palette: 'Paleta',
  text_style: 'Estilo de texto',
  decorative_set: 'Conjunto decorativo',
};

const TYPE_ICONS: Record<PresetType, React.ElementType> = {
  palette: Palette,
  text_style: Type,
  decorative_set: Layers,
};

const FILTERS: { value: PresetType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'palette', label: 'Paletas' },
  { value: 'text_style', label: 'Estilos de texto' },
  { value: 'decorative_set', label: 'Conjuntos decorativos' },
];

const BrandPresetList: React.FC<Props> = ({ companyId }) => {
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  const [filter, setFilter] = useState<PresetType | 'all'>('all');
  const [editing, setEditing] = useState<BrandPreset | null | 'new'>('new' as any);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanyPresets(companyId);
      setPresets(data ?? []);
    } catch {
      setPresets([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await deleteCompanyPreset(companyId, id);
      setPresets(p => p.filter(x => x.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaved = () => {
    setShowEditor(false);
    setEditing(null);
    load();
  };

  const filtered = filter === 'all' ? presets : presets.filter(p => p.type === filter);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                filter === f.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setEditing(null); setShowEditor(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-3.5 h-3.5" /> Novo preset
        </button>
      </div>

      {/* Editor inline */}
      {showEditor && (
        <BrandPresetEditor
          companyId={companyId}
          preset={editing as BrandPreset | null}
          onSaved={handleSaved}
          onCancel={() => { setShowEditor(false); setEditing(null); }}
        />
      )}

      {/* Lista */}
      {loading ? (
        <LoadingSpinner fullArea />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Layers} title="Nenhum preset encontrado." />
      ) : (
        <div className="space-y-2">
          {filtered.map(preset => {
            const Icon = TYPE_ICONS[preset.type];
            return (
              <div key={preset.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{preset.name}</p>
                  <p className="text-xs text-slate-500">{TYPE_LABELS[preset.type]}</p>
                </div>
                {/* Swatches para paleta */}
                {preset.type === 'palette' && Array.isArray(preset.config.colors) && (
                  <div className="flex gap-1 shrink-0">
                    {(preset.config.colors as string[]).slice(0, 5).map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                )}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setEditing(preset); setShowEditor(true); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(preset.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Remover preset"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default BrandPresetList;
