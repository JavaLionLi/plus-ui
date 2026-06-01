import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { LoginInfoQuery, LoginInfoVO } from './types';

export function listLoginInfo(query: LoginInfoQuery) {
  return request<R<PageResult<LoginInfoVO>>>({
    url: '/monitor/loginInfo/list',
    method: 'get',
    params: query
  });
}

export function list(query: LoginInfoQuery) {
  return listLoginInfo(query);
}

export function delLoginInfo(infoId: string | number | Array<string | number>) {
  return request<R>({
    url: `/monitor/loginInfo/${infoId}`,
    method: 'delete'
  });
}

export function unlockLoginInfo(userName: string | string[]) {
  return request<R>({
    url: `/monitor/loginInfo/unlock/${userName}`,
    method: 'get'
  });
}

export function cleanLoginInfo() {
  return request<R>({
    url: '/monitor/loginInfo/clean',
    method: 'delete'
  });
}
