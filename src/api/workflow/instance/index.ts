import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { FlowHisTaskResult, FlowInstanceQuery, FlowInstanceVO } from './types';

export function pageByRunning(query: FlowInstanceQuery) {
  return request<R<PageResult<FlowInstanceVO>>>({
    url: '/workflow/instance/pageByRunning',
    method: 'get',
    params: query
  });
}

export function pageByFinish(query: FlowInstanceQuery) {
  return request<R<PageResult<FlowInstanceVO>>>({
    url: '/workflow/instance/pageByFinish',
    method: 'get',
    params: query
  });
}

export function pageByCurrent(query: FlowInstanceQuery) {
  return request<R<PageResult<FlowInstanceVO>>>({
    url: '/workflow/instance/pageByCurrent',
    method: 'get',
    params: query
  });
}

export function cancelProcessApply(data: {
  id?: string | number;
  businessId?: string | number;
  comment?: string;
  message?: string;
}) {
  return request<R>({
    url: '/workflow/instance/cancelProcessApply',
    method: 'put',
    data
  });
}

export function instanceVariable(instanceId: string | number) {
  return request<R<{ variable: string }>>({
    url: `/workflow/instance/instanceVariable/${instanceId}`,
    method: 'get'
  });
}

export function deleteByInstanceIds(instanceIds: Array<string | number> | string | number) {
  return request<R>({
    url: `/workflow/instance/deleteByInstanceIds/${instanceIds}`,
    method: 'delete'
  });
}

export function deleteHisByInstanceIds(instanceIds: Array<string | number> | string | number) {
  return request<R>({
    url: `/workflow/instance/deleteHisByInstanceIds/${instanceIds}`,
    method: 'delete'
  });
}

export function invalid(data: { id: string | number; comment?: string }) {
  return request<R>({
    url: '/workflow/instance/invalid',
    method: 'post',
    data
  });
}

export function updateVariable(data: { instanceId?: string | number; key?: string; value?: string }) {
  return request<R>({
    url: '/workflow/instance/updateVariable',
    method: 'put',
    data
  });
}

export function flowHisTaskList(businessId: string | number) {
  return request<R<FlowHisTaskResult>>({
    url: `/workflow/instance/flowHisTaskList/${businessId}?t=${Math.random()}`,
    method: 'get'
  });
}
