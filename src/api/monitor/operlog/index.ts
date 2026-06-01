import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { OperLogQuery, OperLogVO } from './types';

export function listOperlog(query: OperLogQuery) {
  return request<R<PageResult<OperLogVO>>>({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  });
}

export function list(query: OperLogQuery) {
  return listOperlog(query);
}

export function delOperlog(operId: string | number | Array<string | number>) {
  return request<R>({
    url: `/monitor/operlog/${operId}`,
    method: 'delete'
  });
}

export function cleanOperlog() {
  return request<R>({
    url: '/monitor/operlog/clean',
    method: 'delete'
  });
}
