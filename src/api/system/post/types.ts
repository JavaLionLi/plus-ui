import type { BaseEntity, PageQuery } from '@/api/types';

export interface PostForm {
  postId?: number | string;
  deptId?: number | string;
  postCode?: string;
  postName?: string;
  postCategory?: string;
  postSort?: number;
  status?: string;
  remark?: string;
}

export interface PostQuery extends PageQuery {
  deptId?: number | string;
  belongDeptId?: number | string;
  postCode?: string;
  postName?: string;
  postCategory?: string;
  status?: string;
}

export interface PostVO extends BaseEntity {
  postId: number | string;
  deptId: number | string;
  postCode: string;
  postName: string;
  postCategory: string;
  deptName: string;
  postSort: number;
  status: string;
}
