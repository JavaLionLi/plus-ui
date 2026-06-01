import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { LeaveForm, LeaveQuery, LeaveVO } from './types';

export function listLeave(query?: LeaveQuery) {
  return request<R<PageResult<LeaveVO>>>({
    url: '/workflow/leave/list',
    method: 'get',
    params: query
  });
}

export function getLeave(id: string | number) {
  return request<R<LeaveVO>>({
    url: `/workflow/leave/${id}`,
    method: 'get'
  });
}

export function addLeave(data: LeaveForm) {
  return request<R<LeaveVO>>({
    url: '/workflow/leave',
    method: 'post',
    data
  });
}

export function submitAndFlowStart(data: LeaveForm) {
  return request<R<LeaveVO>>({
    url: '/workflow/leave/submitAndFlowStart',
    method: 'post',
    data
  });
}

export function updateLeave(data: LeaveForm) {
  return request<R<LeaveVO>>({
    url: '/workflow/leave',
    method: 'put',
    data
  });
}

export function delLeave(id: string | number | Array<string | number>) {
  return request<R>({
    url: `/workflow/leave/${id}`,
    method: 'delete'
  });
}
