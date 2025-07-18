// File: src/components/ImageEditor/ImageConfigManager.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, ClipboardPaste } from 'lucide-react';
import { ImageConfig } from '../../types';

interface ImageConfigManagerProps {
  config: ImageConfig;
  onConfigChange: (config: ImageConfig) => void;
}

// NOVA FUNÇÃO DE LIMPEZA
/**
 * Remove chaves com valores nulos, arrays vazios e simplifica o caminho da fonte.
 * @param obj O objeto de configuração a ser limpo.
 * @returns Um novo objeto de configuração limpo.
 */
const cleanConfigForExport = (obj: any): any => {
  if (obj === null || obj === undefined) return undefined;
  if (Array.isArray(obj)) {
    return obj.map(cleanConfigForExport).filter(v => v !== undefined);
  }
  if (typeof obj !== 'object') {
    return obj;
  }

  const newObj: { [key: string]: any } = {};
  for (const key of Object.keys(obj)) {
    // Regra 1: Ignorar chaves de animação para imagens estáticas
    if (key === 'animation') continue;

    let value = obj[key];
    
    // Regra 2: Simplificar o caminho da fonte para conter apenas o nome do arquivo
    if (key === 'font' && typeof value === 'string') {
        value = value.split(/[\\/]/).pop() || null;
    }

    // Ignora chaves que se tornaram nulas após a simplificação
    if (value === null || value === undefined) continue;

    const cleanedValue = cleanConfigForExport(value);

    // Regra 3: Ignorar chaves com valores nulos, indefinidos ou arrays vazios após a limpeza recursiva
    if (cleanedValue === null || cleanedValue === undefined) continue;
    if (Array.isArray(cleanedValue) && cleanedValue.length === 0) continue;
    
    newObj[key] = cleanedValue;
  }
  return newObj;
};


const ImageConfigManager: React.FC<ImageConfigManagerProps> = ({ config, onConfigChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [pastedJson, setPastedJson] = useState('');

  const exportConfig = () => {
    try {
      // Usa a nova função de limpeza antes de exportar
      const configToExport = cleanConfigForExport(config);
      const configJson = JSON.stringify(configToExport, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vidgen_image_config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({ type: 'success', message: 'Configuração da imagem exportada com sucesso!' });
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Falha ao exportar configuração.' });
    } finally {
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };

  const copyConfigToClipboard = async () => {
    try {
      // Usa a nova função de limpeza antes de copiar
      const configToCopy = cleanConfigForExport(config);
      const configJson = JSON.stringify(configToCopy, null, 2);
      await navigator.clipboard.writeText(configJson);
      setImportStatus({ type: 'success', message: 'Configuração da imagem copiada para a área de transferência!' });
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Falha ao copiar.' });
    } finally {
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };
  
  const processAndApplyConfig = (configObject: any) => {
    const configData = configObject.config || configObject;
    if (configData && typeof configData === 'object' && configData.scene) {
        onConfigChange(configData as ImageConfig);
    } else {
        throw new Error("Formato de configuração de imagem inválido.");
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        processAndApplyConfig(JSON.parse(jsonContent));
        setImportStatus({ type: 'success', message: 'Configuração importada com sucesso!' });
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Falha ao importar. Verifique o arquivo.' });
      } finally {
        setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteAndApply = () => {
    if (!pastedJson.trim()) {
        setImportStatus({ type: 'error', message: 'A área de texto está vazia.' });
        setTimeout(() => setImportStatus({ type: null, message: '' }), 3000); return;
    }
    try {
        processAndApplyConfig(JSON.parse(pastedJson));
        setImportStatus({ type: 'success', message: 'Configuração colada e aplicada com sucesso!' });
        setPastedJson('');
    } catch (error) {
        setImportStatus({ type: 'error', message: 'JSON inválido. Verifique o texto colado.' });
    } finally {
        setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };


  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600" /></div>
        <div>
          <h3 className="font-semibold text-slate-900">Gerenciador de Configurações de Imagem</h3>
          <p className="text-sm text-slate-600">Exporte ou importe a configuração da sua imagem.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={exportConfig} className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          <Download className="w-4 h-4" /> Exportar Config
        </button>
        <button onClick={copyConfigToClipboard} className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
          <FileText className="w-4 h-4" /> Copiar Config
        </button>
      </div>

      {importStatus.type && (
        <div className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${ importStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200' }`}>
          {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className={`text-sm font-medium ${ importStatus.type === 'success' ? 'text-green-800' : 'text-red-800' }`}>{importStatus.message}</span>
        </div>
      )}

      <div className="space-y-4 border-t pt-6">
        <h4 className="font-medium text-slate-900">Importar Configuração</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                    <Upload className="w-4 h-4" /> Importar de Arquivo
                </button>
                <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileImport} className="hidden" />
            </div>
             <div>
                <button onClick={handlePasteAndApply} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                    <ClipboardPaste className="w-4 h-4" /> Aplicar JSON Colado
                </button>
            </div>
        </div>
         <div>
            <label htmlFor="json-paste-area-image" className="block text-sm font-medium text-slate-700 mb-2">Cole o JSON aqui:</label>
            <textarea
                id="json-paste-area-image"
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder="Cole a configuração JSON da imagem aqui..."
                className="w-full p-2 border border-slate-300 rounded-lg min-h-[120px] font-mono text-xs"
            ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ImageConfigManager;