import type { UserQuery, UserVO } from '@/api/system/user/types';
import type { PageResult, R } from '@/api/types';
import request from '@/api/request';
import type { RoleDeptTree, RoleForm, RoleQuery, RoleVO } from './types';

export function listRole(query: RoleQuery) {
  return request<R<PageResult<RoleVO>>>({
    url: '/system/role/list',
    method: 'get',
    params: query
  });
}

export function optionSelect(roleIds: Array<number | string>) {
  return request<R<RoleVO[]>>({
    url: `/system/role/optionselect?roleIds=${roleIds}`,
    method: 'get'
  });
}

export function getRole(roleId: string | number) {
  return request<R<RoleVO>>({
    url: `/system/role/${roleId}`,
    method: 'get'
  });
}

export function addRole(data: RoleForm) {
  return request<R>({
    url: '/system/role',
    method: 'post',
    data
  });
}

export function updateRole(data: RoleForm) {
  return request<R>({
    url: '/system/role',
    method: 'put',
    data
  });
}

export function updateRolePermission(data: RoleForm) {
  return request<R>({
    url: '/system/role/permission',
    method: 'put',
    data
  });
}

export function changeRoleStatus(roleId: string | number, status: string) {
  return request<R>({
    url: '/system/role/changeStatus',
    method: 'put',
    data: {
      roleId,
      status
    }
  });
}

export function delRole(roleId: Array<string | number> | string | number) {
  return request<R>({
    url: `/system/role/${roleId}`,
    method: 'delete'
  });
}

export function allocatedUserList(query: UserQuery) {
  return request<R<PageResult<UserVO>>>({
    url: '/system/role/authUser/allocatedList',
    method: 'get',
    params: query
  });
}

export function unallocatedUserList(query: UserQuery) {
  return request<R<PageResult<UserVO>>>({
    url: '/system/role/authUser/unallocatedList',
    method: 'get',
    params: query
  });
}

export function authUserCancel(data: { roleId: string | number; userId: string | number }) {
  return request<R>({
    url: '/system/role/authUser/cancel',
    method: 'put',
    data
  });
}

export function authUserCancelAll(data: { roleId: string | number; userIds: string }) {
  return request<R>({
    url: '/system/role/authUser/cancelAll',
    method: 'put',
    params: data
  });
}

export function authUserSelectAll(data: { roleId: string | number; userIds: string }) {
  return request<R>({
    url: '/system/role/authUser/selectAll',
    method: 'put',
    params: data
  });
}

export function deptTreeSelect(roleId: string | number) {
  return request<R<RoleDeptTree>>({
    url: `/system/role/deptTree/${roleId}`,
    method: 'get'
  });
}
