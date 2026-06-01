import type { BaseEntity, PageQuery } from '@/api/types';

export interface ClientForm extends BaseEntity {
  id?: string | number;
  clientId?: string | number;
  clientKey?: string;
  clientSecret?: string;
  grantTypeList?: string[];
  deviceType?: string;
  accessPath?: string;
  accessPathList?: string[];
  ipWhitelist?: string;
  ipWhitelistList?: string[];
  activeTimeout?: number;
  timeout?: number;
  status?: string;
}

export interface ClientQuery extends PageQuery {
  clientId?: string | number;
  clientKey?: string;
  clientSecret?: string;
  grantType?: string;
  deviceType?: string;
  accessPath?: string;
  ipWhitelist?: string;
  activeTimeout?: number;
  timeout?: number;
  status?: string;
}

export interface ClientVO {
  id: string | number;
  clientId: string;
  clientKey: string;
  clientSecret: string;
  grantTypeList?: string[];
  deviceType?: string;
  accessPath?: string;
  accessPathList?: string[];
  ipWhitelist?: string;
  ipWhitelistList?: string[];
  activeTimeout?: number;
  timeout?: number;
  status: string;
}
