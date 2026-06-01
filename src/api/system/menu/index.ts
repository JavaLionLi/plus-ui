import type { RoleMenuTree } from '@/api/system/role/types';
import type { R } from '@/api/types';
import request from '@/api/request';
import type { MenuForm, MenuQuery, MenuTreeOption, MenuVO } from './types';

export function listMenu(query?: MenuQuery) {
  return request<R<MenuVO[]>>({
    url: '/system/menu/list',
    method: 'get',
    params: query
  });
}

export function getMenu(menuId: string | number) {
  return request<R<MenuVO>>({
    url: `/system/menu/${menuId}`,
    method: 'get'
  });
}

export function treeselect() {
  return request<R<MenuTreeOption[]>>({
    url: '/system/menu/treeselect',
    method: 'get'
  });
}

export function roleMenuTreeselect(roleId: string | number) {
  return request<R<RoleMenuTree>>({
    url: `/system/menu/roleMenuTreeselect/${roleId}`,
    method: 'get'
  });
}

export function addMenu(data: MenuForm) {
  return request<R>({
    url: '/system/menu',
    method: 'post',
    data
  });
}

export function updateMenu(data: MenuForm) {
  return request<R>({
    url: '/system/menu',
    method: 'put',
    data
  });
}

export function delMenu(menuId: string | number) {
  return request<R>({
    url: `/system/menu/${menuId}`,
    method: 'delete'
  });
}

export function cascadeDelMenu(menuIds: Array<string | number>) {
  return request<R>({
    url: `/system/menu/cascade/${menuIds}`,
    method: 'delete'
  });
}
