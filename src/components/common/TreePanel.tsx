import type { DataNode, EventDataNode } from 'antd/es/tree';
import { LeftOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Tree } from 'antd';
import { useEffect, useMemo, useState, type Key } from 'react';
import { collectTreeKeys } from '@/utils/ruoyi';

export interface TreePanelProps<T extends object = Record<string, unknown>> {
  title: string;
  placeholder?: string;
  data: T[];
  nodeKey?: string;
  fieldNames?: { title?: string; key?: string; children?: string };
  disabledField?: string;
  filterField?: string;
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
  onNodeClick?: (data: T, node: EventDataNode<DataNode>) => void;
}

function getValue(data: object, key: string) {
  return (data as Record<string, unknown>)[key];
}

function filterNodes<T extends object>(
  nodes: T[],
  keyword: string,
  fieldNames: Required<NonNullable<TreePanelProps<T>['fieldNames']>>,
  filterField: string
): T[] {
  if (!keyword) {
    return nodes;
  }

  return nodes.flatMap(node => {
    const children = getValue(node, fieldNames.children) as T[] | undefined;
    const filteredChildren = children?.length ? filterNodes(children, keyword, fieldNames, filterField) : [];
    const label = String(getValue(node, filterField) ?? getValue(node, fieldNames.title) ?? '');
    if (label.includes(keyword) || filteredChildren.length) {
      return [{ ...node, [fieldNames.children]: filteredChildren }];
    }
    return [];
  });
}

function toDataNodes<T extends object>(
  nodes: T[],
  fieldNames: Required<NonNullable<TreePanelProps<T>['fieldNames']>>,
  disabledField: string
): DataNode[] {
  return nodes.map(node => {
    const key = getValue(node, fieldNames.key);
    const title = getValue(node, fieldNames.title);
    const children = getValue(node, fieldNames.children) as T[] | undefined;
    return {
      key: String(key),
      title: String(title ?? ''),
      disabled: Boolean(getValue(node, disabledField)),
      raw: node,
      children: children?.length ? toDataNodes(children, fieldNames, disabledField) : undefined
    } as DataNode;
  });
}

export default function TreePanel<T extends object = Record<string, unknown>>({
  title,
  placeholder = '请输入名称',
  data,
  fieldNames,
  disabledField = 'disabled',
  filterField,
  collapsed,
  onCollapsedChange,
  onNodeClick
}: TreePanelProps<T>) {
  const [innerCollapsed, setInnerCollapsed] = useState(collapsed ?? false);
  const [filterText, setFilterText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const mergedFieldNames = useMemo(
    () => ({
      title: fieldNames?.title || 'label',
      key: fieldNames?.key || 'id',
      children: fieldNames?.children || 'children'
    }),
    [fieldNames]
  );
  const currentFilterField = filterField || mergedFieldNames.title;
  const filteredData = useMemo(
    () => filterNodes(data, filterText, mergedFieldNames, currentFilterField),
    [currentFilterField, data, filterText, mergedFieldNames]
  );
  const treeData = useMemo(
    () => toDataNodes(filteredData, mergedFieldNames, disabledField),
    [disabledField, filteredData, mergedFieldNames]
  );
  const allTreeKeys = useMemo(() => collectTreeKeys(treeData, node => node.key), [treeData]);
  const mergedCollapsed = collapsed ?? innerCollapsed;

  useEffect(() => {
    if (collapsed !== undefined) {
      setInnerCollapsed(collapsed);
    }
  }, [collapsed]);

  useEffect(() => {
    setExpandedKeys(allTreeKeys);
  }, [allTreeKeys]);

  const toggleCollapsed = () => {
    const nextCollapsed = !mergedCollapsed;
    setInnerCollapsed(nextCollapsed);
    onCollapsedChange?.(nextCollapsed);
  };

  return (
    <Card
      className={`tree-panel-react${mergedCollapsed ? ' is-collapsed' : ''}`}
      title={mergedCollapsed ? null : title}
      extra={
        <Button
          type="text"
          size="small"
          icon={<LeftOutlined rotate={mergedCollapsed ? 180 : 0} />}
          onClick={toggleCollapsed}
        />
      }
    >
      {!mergedCollapsed && (
        <>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder={placeholder}
            value={filterText}
            onChange={event => setFilterText(event.target.value)}
          />
          <Tree
            className="tree-panel-tree-react"
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={keys => setExpandedKeys(keys)}
            blockNode
            showLine
            onSelect={(_, info) => {
              const raw = (info.node as DataNode & { raw?: T }).raw;
              if (raw) {
                onNodeClick?.(raw, info.node);
              }
            }}
          />
        </>
      )}
    </Card>
  );
}
