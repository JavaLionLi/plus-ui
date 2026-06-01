import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { OnlineQuery, OnlineVO } from './types';

export function listOnline(query: OnlineQuery) {
  return request<R<PageResult<OnlineVO>>>({
    url: '/monitor/online/list',
    method: 'get',
    params: query
  });
}

export function list(query: OnlineQuery) {
  return listOnline(query);
}

export function forceLogout(tokenId: string) {
  return request<R>({
    url: `/monitor/online/${tokenId}`,
    method: 'delete'
  });
}

export function getOnline() {
  return request<R<OnlineVO[] | PageResult<OnlineVO>>>({
    url: '/monitor/online',
    method: 'get'
  });
}

export function delOnline(tokenId: string) {
  return request<R>({
    url: `/monitor/online/myself/${tokenId}`,
    method: 'delete'
  });
}
