import type { BaseEntity, PageQuery } from '@/api/types';

export interface OssQuery extends Omit<PageQuery, 'isAsc'> {
  fileName?: string;
  originalName?: string;
  fileSuffix?: string;
  createTime?: string;
  service?: string;
  orderByColumn?: string;
  isAsc?: string;
}

export interface OssUploadResult {
  url?: string;
  fileName?: string;
  ossId?: string | number;
}

export interface OssVO extends BaseEntity {
  ossId: string | number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  createByName?: string;
  service?: string;
}
