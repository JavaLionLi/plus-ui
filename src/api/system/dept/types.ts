import type { BaseEntity, PageQuery } from '@/api/types';

export interface DeptForm {
  parentName?: string;
  parentId?: number | string;
  children?: DeptForm[];
  deptId?: number | string;
  deptName?: string;
  deptCategory?: string;
  orderNum?: number;
  leader?: string | number;
  phone?: string;
  email?: string;
  status?: string;
  delFlag?: string;
  ancestors?: string;
}

export interface DeptQuery extends PageQuery {
  deptName?: string;
  deptCategory?: string;
  status?: string;
}

export interface DeptTreeVO extends BaseEntity {
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
  children?: DeptTreeVO[];
  disabled?: boolean;
}

export interface DeptVO extends BaseEntity {
  id?: number | string;
  parentName?: string;
  parentId?: number | string;
  children?: DeptVO[];
  deptId: number | string;
  deptName: string;
  deptCategory?: string;
  orderNum?: number;
  leader?: string;
  phone?: string;
  email?: string;
  status?: string;
  delFlag?: string;
  ancestors?: string;
  menuId?: string | number;
}
