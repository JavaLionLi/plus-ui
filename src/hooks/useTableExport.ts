import { useCallback, useState } from 'react';
import { download } from '@/utils/download';

type ExportParams = Record<string, unknown>;
type FileNameFactory = string | (() => string);

function resolveFileName(fileName: FileNameFactory) {
  return typeof fileName === 'function' ? fileName() : fileName;
}

export function useTableExport(initialParams: ExportParams = {}) {
  const [exportParams, setExportParams] = useState<ExportParams>(initialParams);

  const updateExportParams = useCallback(<T extends ExportParams>(params: T) => {
    setExportParams(params);
    return params;
  }, []);

  const exportFile = useCallback(
    (url: string, fileName: FileNameFactory, params: ExportParams = exportParams) => {
      return download(url, params, resolveFileName(fileName));
    },
    [exportParams]
  );

  return {
    exportParams,
    setExportParams,
    updateExportParams,
    exportFile
  };
}
