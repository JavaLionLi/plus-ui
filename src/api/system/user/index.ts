import type { DeptTreeVO } from '@/api/system/dept/types';
import type { RoleVO } from '@/api/system/role/types';
import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import { parseStrEmpty } from '@/utils/ruoyi';
import type { UserForm, UserInfoVO, UserProfileForm, UserQuery, UserVO } from './types';

export function listUser(query: UserQuery) {
  return request<R<PageResult<UserVO>>>({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
}

export function optionSelect(userIds: Array<number | string>) {
  return request<R<UserVO[]>>({
    url: `/system/user/optionselect?userIds=${userIds}`,
    method: 'get'
  });
}

export function getUser(userId?: string | number) {
  return request<R<UserInfoVO>>({
    url: `/system/user/${parseStrEmpty(userId)}`,
    method: 'get'
  });
}

export function addUser(data: UserForm) {
  return request<R>({
    url: '/system/user',
    method: 'post',
    data
  });
}

export function updateUser(data: UserForm) {
  return request<R>({
    url: '/system/user',
    method: 'put',
    data
  });
}

export function delUser(userId: Array<string | number> | string | number) {
  return request<R>({
    url: `/system/user/${userId}`,
    method: 'delete'
  });
}

export function resetUserPwd(userId: string | number, password: string) {
  return request<R>({
    url: '/system/user/resetPwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: {
      userId,
      password
    }
  });
}

export function changeUserStatus(userId: number | string, status: string) {
  return request<R>({
    url: '/system/user/changeStatus',
    method: 'put',
    data: {
      userId,
      status
    }
  });
}

export function unlockUser(userId: number | string) {
  return request<R>({
    url: `/system/user/unlock/${userId}`,
    method: 'get'
  });
}

export function getUserProfile() {
  return request<R<UserInfoVO>>({
    url: '/system/user/profile',
    method: 'get'
  });
}

export function updateUserProfile(data: UserProfileForm) {
  return request<R>({
    url: '/system/user/profile',
    method: 'put',
    data
  });
}

export function updateUserPwd(oldPassword: string, newPassword: string) {
  return request<R>({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data: {
      oldPassword,
      newPassword
    }
  });
}

export function importUser(data: FormData, updateSupport: boolean) {
  return request<R>({
    url: '/system/user/importData',
    method: 'post',
    params: {
      updateSupport: updateSupport ? 1 : 0
    },
    data
  });
}

export function getAuthRole(userId: string | number) {
  return request<R<{ user: UserVO; roles: RoleVO[] }>>({
    url: `/system/user/authRole/${userId}`,
    method: 'get'
  });
}

export function updateAuthRole(data: { userId: string; roleIds: string }) {
  return request<R>({
    url: '/system/user/authRole',
    method: 'put',
    params: data
  });
}

export function deptTreeSelect() {
  return request<R<DeptTreeVO[]>>({
    url: '/system/user/deptTree',
    method: 'get'
  });
}

export function listUserByDeptId(deptId: string | number) {
  return request<R<UserVO[]>>({
    url: `/system/user/list/dept/${deptId}`,
    method: 'get'
  });
}
