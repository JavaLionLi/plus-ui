import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { DemoForm, DemoQuery, DemoVO } from './types';

export function listDemo(query?: DemoQuery) {
  return request<R<PageResult<DemoVO>>>({
    url: '/demo/demo/list',
    method: 'get',
    params: query
  });
}

export function getDemo(id: string | number) {
  return request<R<DemoVO>>({
    url: `/demo/demo/${id}`,
    method: 'get'
  });
}

export function addDemo(data: DemoForm) {
  return request<R>({
    url: '/demo/demo',
    method: 'post',
    data
  });
}

export function updateDemo(data: DemoForm) {
  return request<R>({
    url: '/demo/demo',
    method: 'put',
    data
  });
}

export function delDemo(id: string | number | Array<string | number>) {
  return request<R>({
    url: `/demo/demo/${id}`,
    method: 'delete'
  });
}
