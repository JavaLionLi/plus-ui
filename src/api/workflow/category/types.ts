import type { BaseEntity } from '@/api/types';

export interface CategoryForm extends BaseEntity {
  categoryId?: string | number;
  categoryName?: string;
  parentId?: string | number;
  orderNum?: number;
}

export interface CategoryQuery {
  categoryName?: string;
}

export interface CategoryTreeVO {
  id: number | string;
  label: string;
  parentId: number | string;
  weight: number;
  children?: CategoryTreeVO[];
}

export interface CategoryVO {
  categoryId: string | number;
  parentId?: string | number;
  categoryName: string;
  orderNum: number;
  createTime?: string;
  children?: CategoryVO[];
}
