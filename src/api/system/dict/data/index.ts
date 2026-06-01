import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { DictData, DictDataForm, DictDataQuery } from './types';

export function getDicts(dictType: string) {
  return request<R<DictData[]>>({
    url: `/system/dict/data/type/${dictType}`,
    method: 'get'
  });
}

export function listData(query: DictDataQuery) {
  return request<R<PageResult<DictData>>>({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  });
}

export function getData(dictCode: string | number) {
  return request<R<DictData>>({
    url: `/system/dict/data/${dictCode}`,
    method: 'get'
  });
}

export function addData(data: DictDataForm) {
  return request<R>({
    url: '/system/dict/data',
    method: 'post',
    data
  });
}

export function updateData(data: DictDataForm) {
  return request<R>({
    url: '/system/dict/data',
    method: 'put',
    data
  });
}

export function delData(dictCode: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/dict/data/${dictCode}`,
    method: 'delete'
  });
}
