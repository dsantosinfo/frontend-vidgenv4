import { useState, useEffect, useCallback } from 'react';
import { FileUploadRecord, FilePurpose } from '../types';
import { apiRequest } from '../config/api';

interface UseFileUploadsOptions {
  fileType?: 'image' | 'video' | 'audio';
  purpose?: FilePurpose;
}

/**
 * Hook customizado para buscar e gerenciar arquivos enviados ao backend.
 * Substitui o padrão repetido de fetchFiles() em 6+ componentes.
 *
 * @param options - Filtros opcionais por tipo de arquivo ou finalidade
 * @returns { files, loading, refetch }
 *
 * @example
 * // Buscar apenas imagens
 * const { files, loading, refetch } = useFileUploads({ fileType: 'image' });
 *
 * @example
 * // Buscar apenas texturas
 * const { files, loading, refetch } = useFileUploads({ purpose: FilePurpose.TEXTURE_IMAGE });
 *
 * @example
 * // Sem filtros (todos os arquivos)
 * const { files, loading, refetch } = useFileUploads();
 */
export function useFileUploads(options?: UseFileUploadsOptions) {
  const [files, setFiles] = useState<FileUploadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      let filtered = data || [];
      if (options?.fileType) {
        filtered = filtered.filter(f => f.file_type === options.fileType);
      }
      if (options?.purpose) {
        filtered = filtered.filter(f => f.purpose === options.purpose);
      }
      setFiles(filtered);
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [options?.fileType, options?.purpose]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, refetch: fetchFiles };
}
