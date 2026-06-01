import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { definitionXmlVO, FlowDefinitionForm, FlowDefinitionQuery, FlowDefinitionVO } from './types';

export function listDefinition(query: FlowDefinitionQuery) {
  return request<R<PageResult<FlowDefinitionVO>>>({
    url: '/workflow/definition/list',
    method: 'get',
    params: query
  });
}

export function unPublishList(query: FlowDefinitionQuery) {
  return request<R<PageResult<FlowDefinitionVO>>>({
    url: '/workflow/definition/unPublishList',
    method: 'get',
    params: query
  });
}

export function definitionXml(definitionId: string) {
  return request<R<definitionXmlVO>>({
    url: `/workflow/definition/definitionXml/${definitionId}`,
    method: 'get'
  });
}

export function deleteDefinition(id: string | string[]) {
  return request<R>({
    url: `/workflow/definition/${id}`,
    method: 'delete'
  });
}

export function activeDefinition(definitionId: string, activityStatus: boolean) {
  return request<R>({
    url: `/workflow/definition/active/${definitionId}`,
    method: 'put',
    params: { active: activityStatus }
  });
}

export function active(definitionId: string, activityStatus: boolean) {
  return activeDefinition(definitionId, activityStatus);
}

export function importDefinition(data: FormData) {
  return request<R>({
    url: '/workflow/definition/importDef',
    method: 'post',
    data,
    headers: { repeatSubmit: false }
  });
}

export function importDef(data: FormData) {
  return importDefinition(data);
}

export function publishDefinition(id: string) {
  return request<R>({
    url: `/workflow/definition/publish/${id}`,
    method: 'put'
  });
}

export function publish(id: string) {
  return publishDefinition(id);
}

export function unPublish(id: string) {
  return request<R>({
    url: `/workflow/definition/unPublish/${id}`,
    method: 'put'
  });
}

export function xmlString(id: string) {
  return request<R<string>>({
    url: `/workflow/definition/xmlString/${id}`,
    method: 'get'
  });
}

export function addDefinition(data: FlowDefinitionForm) {
  return request<R>({
    url: '/workflow/definition',
    method: 'post',
    data
  });
}

export function add(data: FlowDefinitionForm) {
  return addDefinition(data);
}

export function editDefinition(data: FlowDefinitionForm) {
  return request<R>({
    url: '/workflow/definition',
    method: 'put',
    data
  });
}

export function edit(data: FlowDefinitionForm) {
  return editDefinition(data);
}

export function getDefinition(id: string) {
  return request<R<FlowDefinitionVO>>({
    url: `/workflow/definition/${id}`,
    method: 'get'
  });
}

export function getInfo(id: string | number) {
  return getDefinition(String(id));
}

export function copyDefinition(id: string) {
  return request<R>({
    url: `/workflow/definition/copy/${id}`,
    method: 'post'
  });
}

export function copy(id: string) {
  return copyDefinition(id);
}

export function exportDefinition(id: string) {
  return request<Blob>({
    url: `/workflow/definition/exportDef/${id}`,
    method: 'post',
    responseType: 'blob'
  });
}
