import type { PageQuery } from '@/api/types';

export interface LoginInfoQuery extends Omit<PageQuery, 'isAsc'> {
  ipaddr?: string;
  userName?: string;
  status?: string;
  orderByColumn?: string;
  isAsc?: string;
}

export interface LoginInfoVO {
  infoId: string | number;
  tenantId?: string | number;
  userName: string;
  clientKey?: string;
  deviceType?: string;
  status: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  msg?: string;
  loginTime?: string;
}
