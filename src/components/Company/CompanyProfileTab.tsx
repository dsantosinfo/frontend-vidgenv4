// src/components/Company/CompanyProfileTab.tsx
import React, { useState, useEffect } from 'react';
import { updateCompany, getCompanyIndustries } from '../../config/api';
import { StatusBanner, SectionCard } from '../ui';

interface Props {
  companyId: string;
  company: any;
}

const DOCUMENT_TYPES = [
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'cpf',  label: 'CPF' },
];

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
];

const CompanyProfileTab: React.FC<Props> = ({ companyId, company }) => {
  const [industries, setIndustries] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    // Dados legais
    legal_name: company?.legal_name ?? '',
    document: company?.document ?? '',
    document_type: company?.document_type ?? 'cnpj',
    // Área de atuação
    industry: company?.industry ?? '',
    description: company?.description ?? '',
    // Contato
    email: company?.email ?? '',
    phone: company?.phone ?? '',
    website: company?.website ?? '',
    // Endereço
    address_zip: company?.address_zip ?? '',
    address_street: company?.address_street ?? '',
    address_number: company?.address_number ?? '',
    address_complement: company?.address_complement ?? '',
    address_district: company?.address_district ?? '',
    address_city: company?.address_city ?? '',
    address_state: company?.address_state ?? '',
    address_country: company?.address_country ?? 'BR',
    // Responsável técnico
    technical_contact_name: company?.technical_contact_name ?? '',
    technical_contact_email: company?.technical_contact_email ?? '',
    technical_contact_phone: company?.technical_contact_phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    getCompanyIndustries().then(setIndustries).catch(() => {});
  }, []);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const set = (field: string, value: string) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleCepBlur = async () => {
    const cep = form.address_zip.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(f => ({
          ...f,
          address_street:   data.logradouro || f.address_street,
          address_district: data.bairro     || f.address_district,
          address_city:     data.localidade || f.address_city,
          address_state:    data.uf         || f.address_state,
        }));
      }
    } catch { /* silencia */ } finally {
      setLoadingCep(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany(companyId, form);
      flash('success', 'Cadastro salvo com sucesso!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <form onSubmit={handleSave} className="space-y-4">

      {/* Dados Legais */}
      <SectionCard title="Dados Legais">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Razão Social</label>
            <input value={form.legal_name} onChange={e => set('legal_name', e.target.value)}
              placeholder="Nome jurídico da empresa" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tipo de Documento</label>
            <select value={form.document_type} onChange={e => set('document_type', e.target.value)}
              className={inputCls}>
              {DOCUMENT_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>{form.document_type === 'cnpj' ? 'CNPJ' : 'CPF'}</label>
            <input value={form.document} onChange={e => set('document', e.target.value)}
              placeholder={form.document_type === 'cnpj' ? '00.000.000/0001-00' : '000.000.000-00'}
              className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Área de Atuação */}
      <SectionCard title="Área de Atuação">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Segmento</label>
            <select value={form.industry} onChange={e => set('industry', e.target.value)}
              className={inputCls}>
              <option value="">Selecione um segmento</option>
              {industries.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Descrição da empresa</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Descreva brevemente a empresa e seus serviços..."
              className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Contato */}
      <SectionCard title="Contato">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>E-mail comercial</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="contato@empresa.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+55 11 99999-9999" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Site</label>
            <input value={form.website} onChange={e => set('website', e.target.value)}
              placeholder="https://www.empresa.com.br" className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Endereço */}
      <SectionCard title="Endereço">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>CEP {loadingCep && <span className="text-blue-500 text-[10px]">buscando...</span>}</label>
            <input value={form.address_zip} onChange={e => set('address_zip', e.target.value)}
              onBlur={handleCepBlur} placeholder="00000-000" maxLength={9} className={inputCls} />
          </div>
          <div className="sm:col-span-4">
            <label className={labelCls}>Logradouro</label>
            <input value={form.address_street} onChange={e => set('address_street', e.target.value)}
              placeholder="Rua, Avenida..." className={inputCls} />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>Número</label>
            <input value={form.address_number} onChange={e => set('address_number', e.target.value)}
              placeholder="123" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Complemento</label>
            <input value={form.address_complement} onChange={e => set('address_complement', e.target.value)}
              placeholder="Sala, Andar..." className={inputCls} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Bairro</label>
            <input value={form.address_district} onChange={e => set('address_district', e.target.value)}
              placeholder="Bairro" className={inputCls} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Cidade</label>
            <input value={form.address_city} onChange={e => set('address_city', e.target.value)}
              placeholder="Cidade" className={inputCls} />
          </div>
          <div className="sm:col-span-1">
            <label className={labelCls}>UF</label>
            <select value={form.address_state} onChange={e => set('address_state', e.target.value)}
              className={inputCls}>
              <option value="">UF</option>
              {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>País</label>
            <input value={form.address_country} onChange={e => set('address_country', e.target.value)}
              placeholder="BR" maxLength={2} className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {/* Responsável Técnico */}
      <SectionCard title="Responsável Técnico" description="Pessoa de contato para suporte e questões técnicas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo</label>
            <input value={form.technical_contact_name}
              onChange={e => set('technical_contact_name', e.target.value)}
              placeholder="Nome do responsável" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <input type="email" value={form.technical_contact_email}
              onChange={e => set('technical_contact_email', e.target.value)}
              placeholder="tecnico@empresa.com.br" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input value={form.technical_contact_phone}
              onChange={e => set('technical_contact_phone', e.target.value)}
              placeholder="+55 11 99999-9999" className={inputCls} />
          </div>
        </div>
      </SectionCard>

      {status && <StatusBanner type={status.type} msg={status.msg} />}

      <div className="flex justify-end">
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar cadastro'}
        </button>
      </div>
    </form>
  );
};

export default CompanyProfileTab;
