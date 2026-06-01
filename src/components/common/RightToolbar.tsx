import { MenuOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Popover, Space, Tooltip } from 'antd';
import { useEffect, useMemo } from 'react';

export interface RightToolbarColumn {
  key: string;
  label: string;
  visible?: boolean;
}

export interface RightToolbarProps {
  showSearch?: boolean;
  onShowSearchChange?: (value: boolean) => void;
  search?: boolean;
  columns?: RightToolbarColumn[];
  onColumnsChange?: (columns: RightToolbarColumn[]) => void;
  onRefresh?: () => void;
  storageKey?: string;
  gutter?: number;
}

function readStorage(storageKey?: string) {
  if (!storageKey) {
    return undefined;
  }
  try {
    const text = localStorage.getItem(storageKey);
    return text ? (JSON.parse(text) as Record<string, boolean>) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(storageKey: string | undefined, columns: RightToolbarColumn[]) {
  if (!storageKey) {
    return;
  }
  const state = Object.fromEntries(columns.map(column => [column.key, column.visible !== false]));
  localStorage.setItem(storageKey, JSON.stringify(state));
}

export default function RightToolbar({
  showSearch = true,
  onShowSearchChange,
  search = true,
  columns,
  onColumnsChange,
  onRefresh,
  storageKey,
  gutter = 10
}: RightToolbarProps) {
  const checkedKeys = useMemo(
    () => (columns || []).filter(column => column.visible !== false).map(column => column.key),
    [columns]
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: storage restore should run when storage key changes, not on every parent columns render.
  useEffect(() => {
    const stored = readStorage(storageKey);
    if (!stored || !columns?.length) {
      return;
    }
    const nextColumns = columns.map(column => ({ ...column, visible: stored[column.key] ?? column.visible ?? true }));
    onColumnsChange?.(nextColumns);
  }, [storageKey]);

  const changeColumns = (keys: string[]) => {
    const nextColumns = (columns || []).map(column => ({ ...column, visible: keys.includes(column.key) }));
    writeStorage(storageKey, nextColumns);
    onColumnsChange?.(nextColumns);
  };

  return (
    <Space size={8} className="right-toolbar-react" style={{ marginRight: gutter / 2 }}>
      {search && (
        <Tooltip title={showSearch ? '隐藏搜索' : '显示搜索'}>
          <Button shape="circle" icon={<SearchOutlined />} onClick={() => onShowSearchChange?.(!showSearch)} />
        </Tooltip>
      )}
      <Tooltip title="刷新">
        <Button shape="circle" icon={<ReloadOutlined />} onClick={onRefresh} />
      </Tooltip>
      {columns?.length ? (
        <Popover
          placement="bottomRight"
          trigger="click"
          content={
            <div className="right-toolbar-column-popover">
              <div className="right-toolbar-column-title">显示/隐藏列</div>
              <Checkbox.Group value={checkedKeys} onChange={values => changeColumns(values as string[])}>
                <Space direction="vertical" size={6}>
                  {columns.map(column => (
                    <Checkbox key={column.key} value={column.key}>
                      {column.label}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </div>
          }
        >
          <Tooltip title="显示/隐藏列">
            <Button shape="circle" icon={<MenuOutlined />} />
          </Tooltip>
        </Popover>
      ) : null}
    </Space>
  );
}
