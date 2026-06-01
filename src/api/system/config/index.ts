import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { ConfigForm, ConfigQuery, ConfigVO } from './types';

export function listConfig(query: ConfigQuery) {
  return request<R<PageResult<ConfigVO>>>({
    url: '/system/config/list',
    method: 'get',
    params: query
  });
}

export function getConfig(configId: string | number) {
  return request<R<ConfigVO>>({
    url: `/system/config/${configId}`,
    method: 'get'
  });
}

export function getConfigKey(configKey: string) {
  return request<R<string>>({
    url: `/system/config/configKey/${configKey}`,
    method: 'get'
  });
}

export function addConfig(data: ConfigForm) {
  return request<R>({
    url: '/system/config',
    method: 'post',
    data
  });
}

export function updateConfig(data: ConfigForm) {
  return request<R>({
    url: '/system/config',
    method: 'put',
    data
  });
}

export function updateConfigByKey(key: string, value: unknown) {
  return request<R>({
    url: '/system/config/updateByKey',
    method: 'put',
    data: {
      configKey: key,
      configValue: value
    }
  });
}

export function delConfig(configId: string | number | Array<string | number>) {
  return request<R>({
    url: `/system/config/${configId}`,
    method: 'delete'
  });
}

export function refreshConfigCache() {
  return request<R>({
    url: '/system/config/refreshCache',
    method: 'delete'
  });
}

export function refreshCache() {
  return refreshConfigCache();
}
