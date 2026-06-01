import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { SpelForm, SpelQuery, SpelVO } from './types';

export function listSpel(query?: SpelQuery) {
  return request<R<PageResult<SpelVO>>>({
    url: '/workflow/spel/list',
    method: 'get',
    params: query
  });
}

export function getSpel(id: string | number) {
  return request<R<SpelVO>>({
    url: `/workflow/spel/${id}`,
    method: 'get'
  });
}

export function addSpel(data: SpelForm) {
  return request<R>({
    url: '/workflow/spel',
    method: 'post',
    data
  });
}

export function updateSpel(data: SpelForm) {
  return request<R>({
    url: '/workflow/spel',
    method: 'put',
    data
  });
}

export function delSpel(id: string | number | Array<string | number>) {
  return request<R>({
    url: `/workflow/spel/${id}`,
    method: 'delete'
  });
}
