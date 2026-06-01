import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { OssConfigForm, OssConfigQuery, OssConfigVO } from './types';

export function listOssConfig(query: OssConfigQuery) {
  return request<R<PageResult<OssConfigVO>>>({
    url: '/resource/oss/config/list',
    method: 'get',
    params: query
  });
}

export function getOssConfig(ossConfigId: string | number) {
  return request<R<OssConfigVO>>({
    url: `/resource/oss/config/${ossConfigId}`,
    method: 'get'
  });
}

export function addOssConfig(data: OssConfigForm) {
  return request<R>({
    url: '/resource/oss/config',
    method: 'post',
    data
  });
}

export function updateOssConfig(data: OssConfigForm) {
  return request<R>({
    url: '/resource/oss/config',
    method: 'put',
    data
  });
}

export function delOssConfig(ossConfigId: string | number | Array<string | number>) {
  return request<R>({
    url: `/resource/oss/config/${ossConfigId}`,
    method: 'delete'
  });
}

export function changeOssConfigStatus(ossConfigId: string | number, status: string, configKey: string) {
  return request<R>({
    url: '/resource/oss/config/changeStatus',
    method: 'put',
    data: { ossConfigId, status, configKey }
  });
}
