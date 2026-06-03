import { useCallback, useState } from 'react';
import type { Key } from 'react';
import { collectTreeKeys } from '@/utils/ruoyi';

interface UseTreeTableExpandOptions<T extends object> {
  initialExpandAll?: boolean;
  getChildren?: (row: T) => T[] | undefined;
}

export function useTreeTableExpand<T extends object>(
  getKey: (row: T) => Key,
  options: UseTreeTableExpandOptions<T> = {}
) {
  const { initialExpandAll = false, getChildren } = options;
  const [expandAll, setExpandAll] = useState(initialExpandAll);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const getAllKeys = useCallback(
    (rows: T[]) => collectTreeKeys(rows, getKey, getChildren),
    [getChildren, getKey]
  );

  const syncExpandedRows = useCallback(
    (rows: T[], expanded = expandAll) => {
      setExpandedRowKeys(expanded ? getAllKeys(rows) : []);
    },
    [expandAll, getAllKeys]
  );

  const toggleExpandAll = useCallback(
    (rows: T[]) => {
      setExpandAll(current => {
        const next = !current;
        setExpandedRowKeys(next ? getAllKeys(rows) : []);
        return next;
      });
    },
    [getAllKeys]
  );

  const onExpandedRowsChange = useCallback((keys: readonly Key[]) => {
    setExpandedRowKeys([...keys]);
  }, []);

  return {
    expandAll,
    expandedRowKeys,
    setExpandAll,
    setExpandedRowKeys,
    syncExpandedRows,
    toggleExpandAll,
    onExpandedRowsChange
  };
}
