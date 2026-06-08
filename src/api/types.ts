import type { MenuDataItem } from '@ant-design/pro-components';

export interface BaseEntity {
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}

export interface LoginParams {
  username?: string;
  password?: string;
  code?: string;
  uuid?: string;
  rememberMe?: boolean;
  socialCode?: string;
  socialState?: string;
  source?: string;
  clientId?: string;
  grantType?: string;
}

export interface LoginResult {
  access_token: string;
}

export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: 'ascending' | 'descending';
  params?: Record<string, unknown>;
}

export interface PageResult<T = unknown> {
  total: number;
  rows: T[];
}

export interface R<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface RegisterParams {
  username?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
  uuid?: string;
  userType?: string;
  clientId?: string;
  grantType?: string;
}

export interface VerifyCodeResult {
  captchaEnabled: boolean;
  uuid?: string;
  img?: string;
}

export interface RouteMeta {
  title?: string;
  icon?: string | null;
  noCache?: boolean;
  link?: string;
  hidden?: boolean;
  activeMenu?: string;
}

export interface BackendRoute {
  name?: string;
  path: string;
  component?: string;
  redirect?: string;
  query?: string;
  hidden?: boolean;
  alwaysShow?: boolean;
  meta?: RouteMeta;
  children?: BackendRoute[];
}

export type RuntimeMenuItem = Omit<MenuDataItem, 'routes'> & {
  backendRoute?: BackendRoute;
  routes?: RuntimeMenuItem[];
};
