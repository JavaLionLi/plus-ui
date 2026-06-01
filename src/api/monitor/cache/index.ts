import type { R } from '@/api/types';
import request from '@/api/request';
import type { CacheVO } from './types';

export function getCache() {
  return request<R<CacheVO>>({
    url: '/monitor/cache',
    method: 'get'
  });
}
