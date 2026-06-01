import { useCallback, useMemo, useState, type Key } from 'react';

function isSelectableId(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

export function useTableSelection<T, ID extends string | number = string | number>(
  getRowId: (row: T) => ID | undefined | null
) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  const ids = useMemo(() => selectedRows.map(getRowId).filter(isSelectableId) as ID[], [getRowId, selectedRows]);
  const selectedOne = selectedRows.length === 1 ? selectedRows[0] : undefined;
  const single = selectedRows.length !== 1;
  const multiple = selectedRows.length === 0;

  const handleSelectionChange = useCallback((_keys: Key[], rows: T[]) => {
    setSelectedRows(rows);
  }, []);

  const clearSelection = useCallback(() => setSelectedRows([]), []);

  return {
    ids,
    selectedRows,
    selectedOne,
    setSelectedRows,
    single,
    multiple,
    handleSelectionChange,
    clearSelection
  };
}
