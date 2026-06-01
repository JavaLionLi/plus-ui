import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { ClientForm, ClientQuery, ClientVO } from './types';

export function listClient(query?: ClientQuery) {
  return request<R<PageResult<ClientVO>>>({
    url: '/system/client/list',
    method: 'get',
    params: query
  });
}

export function getClient(id: string | number) {
  return request<R<ClientVO>>({
    url: `/system/client/${id}`,
    method: 'get'
  });
}

export function addClient(data: ClientForm) {
  return request<R>({
    url: '/system/client',
    method: 'post',
    data
  });
}

export function updateClient(data: ClientForm) {
  return request<R>({
    url: '/system/client',
    method: 'put',
    data
  });
}

export function delClient(id: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/client/${id}`,
    method: 'delete'
  });
}

export function changeStatus(clientId: string, status: string) {
  return request<R>({
    url: '/system/client/changeStatus',
    method: 'put',
    data: { clientId, status }
  });
}
