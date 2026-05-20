// src/components/Admin/GlobalBrandingTab.tsx
import React, { useState, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';
import {
  updateBranding, uploadLogo, uploadFavicon, deleteBrandingAsset,
} from '../../config/api';
import { StatusBanner, SectionCard } from '../ui';
import AppLogo from '../AppLogo';

const GlobalBrandingTab: React.FC = () => {
  const { branding, reload } = useBranding();

  const [form, setForm] = useState({
    app_name:   branding.app_name,
    tagline:    branding.tagline,
    color_from: branding.color_from,
    color_to:   branding.color_to,
  });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'favicon' | null>(null);
  const [status, setStatus]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const logoRef    = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateBranding(form);
      await reload();
      flash('success', 'Branding global salvo!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File, type: 'logo' | 'favicon') => {
    setUploading(type);
    try {
      if (type === 'logo') await uploadLogo(file);
      else await uploadFavicon(file);
      await reload();
      flash('success', `${type === 'logo' ? 'Logo' : 'Favicon'} atualizado!`);
    } catch (e: any) {
      flash('error', e.message || 'Erro no upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (asset: 'logo' | 'favicon') => {
    try {
      await deleteBrandingAsset(asset);
      await reload();
      flash('success', `${asset === 'logo' ? 'Logo' : 'Favicon'} removido.`);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao remover.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <SectionCard title="Preview">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl">
            <AppLogo size={36} variant="gradient" />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl">
            <AppLogo size={36} variant="light" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <AppLogo size={36} iconOnly variant="gradient" />
            <span className="text-[10px] text-slate-500">Ícone</span>
          </div>
        </div>
      </SectionCard>

      {/* Identidade textual */}
      <SectionCard title="Identidade da Aplicação" description="Nome, slogan e cores do tema — visíveis para todas as empresas">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nome da aplicação</label>
              <input
                value={form.app_name}
                onChange={e => setForm(f => ({ ...f, app_name: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Slogan</label>
              <input
                value={form.tagline}
                onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Cores do gradiente</label>
            <div className="flex items-center gap-3">
              <input
                type="color" value={form.color_from}
                onChange={e => setForm(f => ({ ...f, color_from: e.target.value }))}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <div
                className="flex-1 h-7 rounded-lg border border-slate-200"
                style={{ background: `linear-gradient(to right, ${form.color_from}, ${form.color_to})` }}
              />
              <input
                type="color" value={form.color_to}
                onChange={e => setForm(f => ({ ...f, color_to: e.target.value }))}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
            </div>
          </div>

          {status && <StatusBanner type={status.type} msg={status.msg} />}

          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar branding'}
          </button>
        </form>
      </SectionCard>

      {/* Logo e Favicon */}
      <SectionCard title="Logo e Favicon" description="Arquivos servidos globalmente para todas as empresas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['logo', 'favicon'] as const).map(asset => (
            <div key={asset} className="border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-800 capitalize">{asset}</p>
              <div className="h-20 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                {branding[`${asset}_url` as 'logo_url' | 'favicon_url'] ? (
                  <img
                    src={branding[`${asset}_url` as 'logo_url' | 'favicon_url']!}
                    alt={asset}
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-400">Nenhum {asset} enviado</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => asset === 'logo' ? logoRef.current?.click() : faviconRef.current?.click()}
                  disabled={uploading === asset}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading === asset ? 'Enviando...' : 'Enviar'}
                </button>
                {branding[`${asset}_url` as 'logo_url' | 'favicon_url'] && (
                  <button
                    onClick={() => handleDelete(asset)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <input ref={logoRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
        <input ref={faviconRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'favicon')} />
      </SectionCard>
    </div>
  );
};

export default GlobalBrandingTab;
