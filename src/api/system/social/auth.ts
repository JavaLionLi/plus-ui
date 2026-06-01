import type { R } from '@/api/types';
import request from '@/api/request';
import type { SocialAuthVO } from './types';

export function authRouterUrl(source: string) {
  return request<R<string>>({
    url: `/auth/binding/${source}`,
    method: 'get'
  });
}

export function authUnlock(authId: string) {
  return request<R>({
    url: `/auth/unlock/${authId}`,
    method: 'delete'
  });
}

export function getAuthList() {
  return request<R<SocialAuthVO[]>>({
    url: '/system/social/list',
    method: 'get'
  });
}
