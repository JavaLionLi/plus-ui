import type { BaseEntity, PageQuery } from '@/api/types';

export interface DictTypeForm {
  dictId?: number | string;
  dictName?: string;
  dictType?: string;
  remark?: string;
}

export interface DictTypeQuery extends PageQuery {
  dictName?: string;
  dictType?: string;
}

export interface DictTypeVO extends BaseEntity {
  dictId: number | string;
  dictName: string;
  dictType: string;
}
