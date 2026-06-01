import type { UserInfo } from '@/api/system/user/types';
export function hasPermi(userInfo: UserInfo | undefined, permissions: string[]) {
  const current = userInfo?.permissions || [];
  if (current.includes('*:*:*')) return true;
  return permissions.some(permission => current.includes(permission));
}

export function hasRole(userInfo: UserInfo | undefined, roles: string[]) {
  const current = userInfo?.roles || [];
  if (current.includes('admin')) return true;
  return roles.some(role => current.includes(role));
}
