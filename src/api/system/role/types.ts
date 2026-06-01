import type { DeptTreeVO } from '@/api/system/dept/types';
import type { MenuTreeOption } from '@/api/system/menu/types';
import type { BaseEntity, PageQuery } from '@/api/types';

export interface RoleDeptTree {
  checkedKeys: Array<string | number>;
  depts: DeptTreeVO[];
}

export interface RoleForm {
  roleId?: string | number;
  roleName?: string;
  roleKey?: string;
  roleSort?: number;
  status?: string;
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  remark?: string;
  dataScope?: string;
  menuIds?: Array<string | number>;
  deptIds?: Array<string | number>;
}

export interface RoleMenuTree {
  menus: MenuTreeOption[];
  checkedKeys: Array<string | number>;
}

export interface RoleQuery extends PageQuery {
  roleName?: string;
  roleKey?: string;
  status?: string;
}

export interface RoleVO extends BaseEntity {
  roleId: string | number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly?: boolean;
  deptCheckStrictly?: boolean;
  status: string;
  flag: boolean;
  admin: boolean;
  menuIds?: Array<string | number>;
  deptIds?: Array<string | number>;
}
