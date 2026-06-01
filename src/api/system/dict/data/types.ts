import type { BaseEntity, PageQuery } from '@/api/types';

export interface DictData extends BaseEntity {
  dictCode: string | number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault?: string;
  status: string;
}

export type DictDataVO = DictData;

export interface DictDataForm {
  dictType?: string;
  dictCode?: string | number;
  dictLabel?: string;
  dictValue?: string;
  cssClass?: string;
  listClass?: string;
  dictSort?: number;
  remark?: string;
}

export interface DictDataQuery extends PageQuery {
  dictName?: string;
  dictType?: string;
  dictLabel?: string;
}
