import type { BaseEntity, PageQuery } from '@/api/types';

export interface OperLogQuery extends Omit<PageQuery, 'isAsc'> {
  operIp?: string;
  title?: string;
  operName?: string;
  userId?: string;
  deptId?: string;
  clientKey?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  businessType?: string;
  status?: string;
  orderByColumn?: string;
  isAsc?: string;
}

export interface OperLogVO extends BaseEntity {
  operId: string | number;
  tenantId?: string;
  title?: string;
  businessType?: number | string;
  businessTypes?: number[];
  method?: string;
  requestMethod?: string;
  operatorType?: number;
  operName?: string;
  userId?: string | number;
  deptId?: string | number;
  deptName?: string;
  clientKey?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status?: number | string;
  errorMsg?: string;
  operTime?: string;
  costTime?: number;
}
