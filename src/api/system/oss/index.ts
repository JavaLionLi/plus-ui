import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { OssQuery, OssUploadResult, OssVO } from './types';

export function listOss(query: OssQuery) {
  return request<R<PageResult<OssVO>>>({
    url: '/resource/oss/list',
    method: 'get',
    params: query
  });
}

export function listOssByIds(ossId: string | number) {
  return request<R<OssVO[]>>({
    url: `/resource/oss/listByIds/${ossId}`,
    method: 'get'
  });
}

export function listByIds(ossId: string | number) {
  return listOssByIds(ossId);
}

export function uploadOss(data: FormData) {
  return request<R<OssUploadResult>>({
    url: '/resource/oss/upload',
    method: 'post',
    data
  });
}

export function delOss(ossId: string | number | Array<string | number>) {
  return request<R>({
    url: `/resource/oss/${ossId}`,
    method: 'delete'
  });
}

export function downloadOss(ossId: string | number) {
  return request<Blob>({
    url: `/resource/oss/download/${ossId}`,
    method: 'get',
    responseType: 'blob'
  });
}
