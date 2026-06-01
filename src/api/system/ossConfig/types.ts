import type { BaseEntity, PageQuery } from '@/api/types';

export interface OssConfigForm {
  ossConfigId?: string | number;
  configKey?: string;
  accessKey?: string;
  secretKey?: string;
  bucketName?: string;
  prefix?: string;
  endpoint?: string;
  domainUrl?: string;
  isHttps?: string;
  accessPolicy?: string;
  region?: string;
  status?: string;
  remark?: string;
}

export interface OssConfigQuery extends PageQuery {
  configKey?: string;
  bucketName?: string;
  status?: string;
}

export interface OssConfigVO extends BaseEntity {
  ossConfigId: number | string;
  configKey: string;
  accessKey: string;
  secretKey: string;
  bucketName: string;
  prefix?: string;
  endpoint: string;
  domainUrl?: string;
  isHttps: string;
  region?: string;
  status: string;
  ext1?: string;
  accessPolicy: string;
}
