import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { DbTableQuery, DbTableVO, GenTableDetailPayload, TableQuery, TableVO } from './types';

export function listTable(query: TableQuery) {
  return request<R<PageResult<TableVO>>>({
    url: '/tool/gen/list',
    method: 'get',
    params: query
  });
}

export function listDbTable(query: DbTableQuery) {
  return request<R<PageResult<DbTableVO>>>({
    url: '/tool/gen/db/list',
    method: 'get',
    params: query
  });
}

export function getGenTable(tableId: string | number) {
  return request<R<GenTableDetailPayload>>({
    url: `/tool/gen/${tableId}`,
    method: 'get'
  });
}

export function updateGenTable(data: DbTableVO & { columns?: unknown[]; params?: Record<string, unknown> }) {
  return request<R>({
    url: '/tool/gen',
    method: 'put',
    data
  });
}

export function importTable(data: { tables: string; dataName: string }) {
  return request<R>({
    url: '/tool/gen/importTable',
    method: 'post',
    params: data
  });
}

export function previewTable(tableId: string | number) {
  return request<R<Record<string, string>>>({
    url: `/tool/gen/preview/${tableId}`,
    method: 'get'
  });
}

export function delTable(tableId: string | number | Array<string | number>) {
  return request<R>({
    url: `/tool/gen/${tableId}`,
    method: 'delete'
  });
}

export function synchDb(tableId: string | number) {
  return request<R>({
    url: `/tool/gen/synchDb/${tableId}`,
    method: 'get'
  });
}

export function getDataNames() {
  return request<R<string[]>>({
    url: '/tool/gen/getDataNames',
    method: 'get'
  });
}

export function batchGenCode(tableIdStr: string) {
  return request<Blob>({
    url: `/tool/gen/batchGenCode?tableIdStr=${tableIdStr}`,
    method: 'get',
    responseType: 'blob'
  });
}
