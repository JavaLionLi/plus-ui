import type { BaseEntity, PageQuery } from '@/api/types';

export interface DemoForm extends BaseEntity {
  id?: string | number;
  deptId?: string | number;
  userId?: string | number;
  orderNum?: number;
  testKey?: string;
  value?: string;
}

export interface DemoQuery extends PageQuery {
  deptId?: string | number;
  userId?: string | number;
  orderNum?: number;
  testKey?: string;
  value?: string;
}

export interface DemoVO {
  id: string | number;
  deptId: string | number;
  userId: string | number;
  orderNum: number;
  testKey: string;
  value: string;
}
