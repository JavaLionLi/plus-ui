import type { R } from '@/api/types';
import request from '@/api/request';
import type { DeptForm, DeptQuery, DeptVO } from './types';

export function listDept(query?: DeptQuery) {
  return request<R<DeptVO[]>>({
    url: '/system/dept/list',
    method: 'get',
    params: query
  });
}

export function optionSelect(deptIds: Array<number | string>) {
  return request<R<DeptVO[]>>({
    url: `/system/dept/optionselect?deptIds=${deptIds}`,
    method: 'get'
  });
}

export function listDeptExcludeChild(deptId: string | number) {
  return request<R<DeptVO[]>>({
    url: `/system/dept/list/exclude/${deptId}`,
    method: 'get'
  });
}

export function getDept(deptId: string | number) {
  return request<R<DeptVO>>({
    url: `/system/dept/${deptId}`,
    method: 'get'
  });
}

export function addDept(data: DeptForm) {
  return request<R>({
    url: '/system/dept',
    method: 'post',
    data
  });
}

export function updateDept(data: DeptForm) {
  return request<R>({
    url: '/system/dept',
    method: 'put',
    data
  });
}

export function delDept(deptId: number | string) {
  return request<R>({
    url: `/system/dept/${deptId}`,
    method: 'delete'
  });
}
