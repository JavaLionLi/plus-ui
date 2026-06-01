import type { PageResult, R } from '@/api/types';
import type { StartProcessBo } from '@/api/workflow/workflowCommon/types';
import request from '@/api/request';
import type { FlowNextNodeVO, FlowTaskVO, StartWorkflowResult, TaskOperationBo, TaskQuery } from './types';

export function pageByTaskWait(query: TaskQuery) {
  return request<R<PageResult<FlowTaskVO>>>({
    url: '/workflow/task/pageByTaskWait',
    method: 'get',
    params: query
  });
}

export function pageByTaskFinish(query: TaskQuery) {
  return request<R<PageResult<FlowTaskVO>>>({
    url: '/workflow/task/pageByTaskFinish',
    method: 'get',
    params: query
  });
}

export function pageByTaskCopy(query: TaskQuery) {
  return request<R<PageResult<FlowTaskVO>>>({
    url: '/workflow/task/pageByTaskCopy',
    method: 'get',
    params: query
  });
}

export function pageByAllTaskWait(query: TaskQuery) {
  return request<R<PageResult<FlowTaskVO>>>({
    url: '/workflow/task/pageByAllTaskWait',
    method: 'get',
    params: query
  });
}

export function pageByAllTaskFinish(query: TaskQuery) {
  return request<R<PageResult<FlowTaskVO>>>({
    url: '/workflow/task/pageByAllTaskFinish',
    method: 'get',
    params: query
  });
}

export function startWorkFlow(data: StartProcessBo) {
  return request<R<StartWorkflowResult>>({
    url: '/workflow/task/startWorkFlow',
    method: 'post',
    data
  });
}

export function updateAssignee(taskIdList: Array<string | number>, userId: string | number) {
  return request<R>({
    url: `/workflow/task/updateAssignee/${userId}`,
    method: 'put',
    data: taskIdList
  });
}

export function urgeTask(data: { taskIdList: Array<string | number>; message?: string; messageType?: string[] }) {
  return request<R>({
    url: '/workflow/task/urgeTask',
    method: 'post',
    data
  });
}

export function completeTask(data: Record<string, unknown>) {
  return request<R>({
    url: '/workflow/task/completeTask',
    method: 'post',
    data
  });
}

export function backProcess(data: Record<string, unknown>) {
  return request<R>({
    url: '/workflow/task/backProcess',
    method: 'post',
    data
  });
}

export function getTask(taskId: string | number) {
  return request<R<FlowTaskVO>>({
    url: `/workflow/task/getTask/${taskId}`,
    method: 'get'
  });
}

export function terminationTask(data: { taskId?: string | number; comment?: string }) {
  return request<R>({
    url: '/workflow/task/terminationTask',
    method: 'post',
    data
  });
}

export function getBackTaskNode(taskId: string | number, nodeCode?: string) {
  return request<R<FlowNextNodeVO[]>>({
    url: `/workflow/task/getBackTaskNode/${taskId}/${nodeCode || ''}`,
    method: 'get'
  });
}

export function taskOperation(data: TaskOperationBo, operation: string) {
  return request<R>({
    url: `/workflow/task/taskOperation/${operation}`,
    method: 'post',
    data
  });
}

export function currentTaskAllUser(taskId: string | number) {
  return request<R<Array<{ userId: string | number; nickName: string; nodeName?: string }>>>({
    url: `/workflow/task/currentTaskAllUser/${taskId}`,
    method: 'get'
  });
}

export function getNextNodeList(data: { taskId?: string | number; variables?: Record<string, unknown> }) {
  return request<R<FlowNextNodeVO[]>>({
    url: '/workflow/task/getNextNodeList',
    method: 'post',
    data
  });
}
