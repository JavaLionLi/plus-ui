import type { BaseEntity } from '@/api/types';

export interface TreeForm extends BaseEntity {
  id?: string | number;
  parentId?: string | number;
  deptId?: string | number;
  userId?: string | number;
  treeName?: string;
}

export interface TreeQuery {
  parentId?: string | number;
  deptId?: string | number;
  userId?: string | number;
  treeName?: string;
}

export interface TreeVO {
  id: string | number;
  parentId: string | number;
  deptId: string | number;
  userId: string | number;
  treeName: string;
  children?: TreeVO[];
}
