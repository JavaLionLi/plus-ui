import type { R } from '@/api/types';
import request from '@/api/request';
import type { TreeForm, TreeQuery, TreeVO } from './types';

export function listTree(query?: TreeQuery) {
  return request<R<TreeVO[]>>({
    url: '/demo/tree/list',
    method: 'get',
    params: query
  });
}

export function getTree(id: string | number) {
  return request<R<TreeVO>>({
    url: `/demo/tree/${id}`,
    method: 'get'
  });
}

export function addTree(data: TreeForm) {
  return request<R>({
    url: '/demo/tree',
    method: 'post',
    data
  });
}

export function updateTree(data: TreeForm) {
  return request<R>({
    url: '/demo/tree',
    method: 'put',
    data
  });
}

export function delTree(id: string | number | Array<string | number>) {
  return request<R>({
    url: `/demo/tree/${id}`,
    method: 'delete'
  });
}
