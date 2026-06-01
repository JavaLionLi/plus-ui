import type { BaseEntity, PageQuery } from '@/api/types';

export interface SpelForm extends BaseEntity {
  id?: string | number;
  componentName?: string;
  methodName?: string;
  methodParams?: string;
  viewSpel?: string;
  status?: string;
  remark?: string;
}

export interface SpelQuery extends PageQuery {
  componentName?: string;
  methodName?: string;
  methodParams?: string;
  viewSpel?: string;
  status?: string;
}

export interface SpelVO {
  id: string | number;
  componentName?: string;
  methodName?: string;
  methodParams?: string;
  viewSpel?: string;
  status?: string;
  remark?: string;
}
