// File: src/components/VideoEditor/ConfigManager.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useRef, useState } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle, ClipboardPaste } from 'lucide-react';
import { VideoConfig } from '../../types';

// Interface de propriedades para este componente
interface ConfigManagerProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

// NOVA FUNÇÃO DE LIMPEZA
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
    let value = obj[key];
    
    if (key === 'font' && typeof value === 'string') {
        value = value.split(/[\\/]/).pop() || null;
    }

    if (value === null || value === undefined) continue;

    const cleanedValue = cleanConfigForExport(value);

    if (cleanedValue === null || cleanedValue === undefined) continue;
    if (Array.isArray(cleanedValue) && cleanedValue.length === 0) continue;
    
    newObj[key] = cleanedValue;
  }
  return newObj;
};


// CORREÇÃO: Usando o nome correto da interface -> ConfigManagerProps
const ConfigManager: React.FC<ConfigManagerProps> = ({ config, onConfigChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [pastedJson, setPastedJson] = useState('');

  const convertToApiFormat = (feConfig: VideoConfig) => {
    return {
      ...feConfig,
      scenes: feConfig.scenes.map(scene => ({
        ...scene,
        transition_from_previous: scene.transition ? { type: scene.transition, duration: 1.0 } : null,
        text_elements: scene.text_elements.map(textEl => ({
          ...textEl,
          animation: textEl.animation ? { type: textEl.animation, duration: 1.0 } : null
        }))
      })),
    };
  };

  const convertApiFormatToFrontend = (apiConfig: any): VideoConfig => {
    const feConfig = { ...apiConfig };
    feConfig.scenes = feConfig.scenes.map((scene: any) => {
        const { transition_from_previous, ...restOfScene } = scene;
        const feScene = { ...restOfScene, transition: transition_from_previous?.type || null };
        feScene.text_elements = scene.text_elements.map((textEl: any) => {
            const { animation, ...restOfTextEl } = textEl;
            return { ...restOfTextEl, animation: animation?.type || null };
        });
        return feScene;
    });
    return feConfig as VideoConfig;
  };

  const getConfigForExport = () => {
    const apiReadyConfig = convertToApiFormat(config);
    return cleanConfigForExport(apiReadyConfig);
  };
  
  const getFullApiPayload = () => {
    return { config: convertToApiFormat(config) };
  };

  const exportConfig = () => {
    try {
      const configToExport = getConfigForExport();
      const configJson = JSON.stringify(configToExport, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vidgen_config_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({ type: 'success', message: 'Configuração exportada com sucesso!' });
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Falha ao exportar configuração.' });
    } finally {
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };

  const copyConfigToClipboard = async () => {
    try {
      const configToCopy = getConfigForExport();
      const configJson = JSON.stringify(configToCopy, null, 2);
      await navigator.clipboard.writeText(configJson);
      setImportStatus({ type: 'success', message: 'Configuração copiada para a área de transferência!' });
    } catch (error) {
      setImportStatus({ type: 'error', message: 'Falha ao copiar.' });
    } finally {
      setTimeout(() => setImportStatus({ type: null, message: '' }), 3000);
    }
  };

  const processAndApplyConfig = (configObject: any) => {
    const configData = configObject.config || configObject;
    if (configData && typeof configData === 'object' && Array.isArray(configData.scenes)) {
        const frontendReadyConfig = convertApiFormatToFrontend(configData);
        onConfigChange(frontendReadyConfig);
    } else {
        throw new Error('Formato de configuração de vídeo inválido.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        processAndApplyConfig(JSON.parse(e.target?.result as string));
        setImportStatus({ type: 'success', message: 'Configuração importada com sucesso!' });
      } catch (error) {
        setImportStatus({ type: 'error', message: 'Falha ao importar. Verifique o formato do arquivo.' });
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
          <h3 className="font-semibold text-slate-900">Gerenciador de Configurações de Vídeo</h3>
          <p className="text-sm text-slate-600">Exporte ou importe a configuração do seu vídeo.</p>
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
            <label htmlFor="json-paste-area" className="block text-sm font-medium text-slate-700 mb-2">Cole o JSON aqui:</label>
            <textarea
                id="json-paste-area"
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder="Cole a configuração JSON aqui..."
                className="w-full p-2 border border-slate-300 rounded-lg min-h-[120px] font-mono text-xs"
            ></textarea>
        </div>
      </div>
      
      <div className="mt-6 border-t pt-6">
        <h4 className="font-medium text-slate-900 mb-3">Visualização do Payload da API (Para Debug)</h4>
        <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-auto">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap">
            {JSON.stringify(getFullApiPayload(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ConfigManager;