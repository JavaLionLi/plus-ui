import type { BaseEntity, PageQuery } from '@/api/types';

export interface ConfigForm {
  configId?: number | string;
  configName?: string;
  configKey?: string;
  configValue?: string;
  configType?: string;
  remark?: string;
}

export interface ConfigQuery extends PageQuery {
  configName?: string;
  configKey?: string;
  configType?: string;
}

export interface ConfigVO extends BaseEntity {
  configId: number | string;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
}
