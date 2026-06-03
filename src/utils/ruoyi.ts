import dayjs, { type ConfigType } from 'dayjs';
import type { Key } from 'react';

export function tansParams(params: Record<string, unknown>) {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const key of Object.keys(value as Record<string, unknown>)) {
          const childValue = (value as Record<string, unknown>)[key];
          if (childValue !== null && childValue !== '' && typeof childValue !== 'undefined') {
            result += `${encodeURIComponent(`${propName}[${key}]`)}=${encodeURIComponent(String(childValue))}&`;
          }
        }
      } else {
        result += `${part}${encodeURIComponent(String(value))}&`;
      }
    }
  }
  return result;
}

export function isHttp(url?: string) {
  return !!url && /^(http|https):\/\//.test(url);
}

export function normalizePath(path: string) {
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function parseStrEmpty(value?: string | number) {
  if (!value || value === 'undefined' || value === 'null') return '';
  return value;
}

export function addDateRange<T extends Record<string, unknown>>(
  params: T,
  dateRange?: [string, string] | null,
  propName?: string
) {
  if (!dateRange?.length) return params;
  const beginKey = propName ? `begin${propName}` : 'beginTime';
  const endKey = propName ? `end${propName}` : 'endTime';
  return {
    ...params,
    params: {
      ...((params.params as Record<string, unknown>) || {}),
      [beginKey]: dateRange[0],
      [endKey]: dateRange[1]
    }
  };
}

export function normalizeSortOrder(order?: string | null) {
  if (order === 'ascend') return 'ascending';
  if (order === 'descend') return 'descending';
  return order || undefined;
}

export function formatDateTimeRange(dateRange?: [ConfigType, ConfigType] | null) {
  if (!dateRange?.[0] || !dateRange?.[1]) return null;
  return [dayjs(dateRange[0]).format('YYYY-MM-DD HH:mm:ss'), dayjs(dateRange[1]).format('YYYY-MM-DD HH:mm:ss')] as [
    string,
    string
  ];
}

export function toDayjsValue(value?: ConfigType | null) {
  return value ? dayjs(value) : undefined;
}

export function formatDateTimeValue(value: unknown) {
  if (!value) return value;
  return dayjs(value as ConfigType).format('YYYY-MM-DD HH:mm:ss');
}

export function toDayjsFields<T extends Record<string, unknown>>(data: T, fields: string[]) {
  const next: Record<string, unknown> = { ...data };
  for (const field of fields) {
    if (next[field]) {
      next[field] = toDayjsValue(next[field] as ConfigType);
    }
  }
  return next as T;
}

export function formatDateTimeFields<T extends Record<string, unknown>>(data: T, fields: string[]) {
  const next: Record<string, unknown> = { ...data };
  for (const field of fields) {
    if (next[field]) {
      next[field] = formatDateTimeValue(next[field]);
    }
  }
  return next as T;
}

export function toPageQuery<T extends object>(params: T & { current?: number; pageSize?: number }) {
  const { current, pageSize, ...rest } = params;
  return {
    ...rest,
    pageNum: current,
    pageSize
  };
}

export function withTableSort<T extends { orderByColumn?: unknown; isAsc?: unknown }>(
  query: T,
  sort?: Record<string, string | null | undefined>,
  defaults?: { orderByColumn?: string; isAsc?: string }
) {
  const sortEntry = Object.entries(sort || {})[0];
  return {
    ...query,
    orderByColumn: sortEntry?.[0] || query.orderByColumn || defaults?.orderByColumn,
    isAsc: normalizeSortOrder(sortEntry?.[1]) || (query.isAsc as string | undefined) || defaults?.isAsc
  };
}

export function toTableData<T>(res: { data?: { rows?: T[]; total?: number } }) {
  return {
    data: res.data?.rows || [],
    total: res.data?.total || 0,
    success: true
  };
}

export async function blobValidate(data: Blob) {
  if (data.type && data.type !== 'application/json') {
    return true;
  }
  try {
    const text = await data.text();
    const payload = JSON.parse(text) as { code?: number; msg?: string };
    return !payload.code || payload.code === 200;
  } catch {
    return true;
  }
}

export async function parseBlobErrorMessage(data: Blob) {
  try {
    const text = await data.text();
    const payload = JSON.parse(text) as { msg?: string; message?: string };
    return payload.msg || payload.message || '下载文件失败';
  } catch {
    return '下载文件失败';
  }
}

export function handleTree<T>(data: T[], id = 'id', parentId = 'parentId', children = 'children'): T[] {
  const childrenListMap = new Map<string | number, T>();
  const tree: T[] = [];
  for (const item of data) {
    const record = item as Record<string, unknown>;
    const itemId = record[id] as string | number;
    childrenListMap.set(itemId, item);
    if (!record[children]) {
      record[children] = [];
    }
  }

  for (const item of data) {
    const record = item as Record<string, unknown>;
    const pid = record[parentId] as string | number;
    const parent = childrenListMap.get(pid);
    if (!parent) {
      tree.push(item);
    } else {
      ((parent as Record<string, unknown>)[children] as T[]).push(item);
    }
  }
  return tree;
}

export function collectTreeKeys<T extends object>(
  nodes: T[],
  getKey: (node: T) => Key,
  getChildren: (node: T) => T[] | undefined = node => (node as Record<string, unknown>).children as T[] | undefined
): Key[] {
  return nodes.flatMap(node => {
    const children = getChildren(node);
    return [getKey(node), ...(children?.length ? collectTreeKeys(children, getKey, getChildren) : [])];
  });
}

export function filterTree<T extends object>(
  nodes: T[],
  predicate: (node: T) => boolean,
  children = 'children'
): T[] {
  return nodes
    .filter(predicate)
    .map(node => {
      const record = node as Record<string, unknown>;
      return {
        ...node,
        [children]: filterTree((record[children] as T[] | undefined) || [], predicate, children)
      } as T;
    });
}
