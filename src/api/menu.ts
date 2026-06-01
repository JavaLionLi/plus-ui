import type { BackendRoute, R } from '@/api/types';
import request from '@/api/request';

export function getRouters() {
  return request<R<BackendRoute[]>>({
    url: '/system/menu/getRouters',
    method: 'get'
  });
}
