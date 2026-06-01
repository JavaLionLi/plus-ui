import type { BaseEntity, PageQuery } from '@/api/types';

export interface OnlineQuery extends PageQuery {
  ipaddr?: string;
  userName?: string;
}

export interface OnlineVO extends BaseEntity {
  tokenId: string;
  deptName?: string;
  userName: string;
  clientKey?: string;
  deviceType?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  loginTime?: number | string;
}
