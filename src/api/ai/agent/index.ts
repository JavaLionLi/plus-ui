import type { R } from '@/api/types';
import request from '@/api/request';
import type { SnailOpenApiUser } from './types';

export function registerCurrentSnailUser() {
  return request<R<SnailOpenApiUser>>({
    url: '/snail-ai/user/register',
    method: 'post'
  });
}
