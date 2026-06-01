import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { DictTypeForm, DictTypeQuery, DictTypeVO } from './types';

export function listType(query: DictTypeQuery) {
  return request<R<PageResult<DictTypeVO>>>({
    url: '/system/dict/type/list',
    method: 'get',
    params: query
  });
}

export function getType(dictId: number | string) {
  return request<R<DictTypeVO>>({
    url: `/system/dict/type/${dictId}`,
    method: 'get'
  });
}

export function addType(data: DictTypeForm) {
  return request<R>({
    url: '/system/dict/type',
    method: 'post',
    data
  });
}

export function updateType(data: DictTypeForm) {
  return request<R>({
    url: '/system/dict/type',
    method: 'put',
    data
  });
}

export function delType(dictId: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/dict/type/${dictId}`,
    method: 'delete'
  });
}

export function refreshCache() {
  return request<R>({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  });
}

export function optionselect() {
  return request<R<DictTypeVO[]>>({
    url: '/system/dict/type/optionselect',
    method: 'get'
  });
}
