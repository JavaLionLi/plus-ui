import type { BaseEntity } from '@/api/types';

export interface MenuForm {
  parentName?: string;
  parentId?: string | number;
  children?: MenuForm[];
  menuId?: string | number;
  menuName?: string;
  orderNum?: number;
  path?: string;
  component?: string;
  queryParam?: string;
  isFrame?: string;
  isCache?: string;
  menuType?: 'M' | 'C' | 'F' | string;
  visible?: string;
  status?: string;
  icon?: string | null;
  activeMenu?: string;
  ext?: string;
  remark?: string;
  query?: string;
  perms?: string;
}

export interface MenuQuery {
  keywords?: string;
  menuName?: string;
  status?: string;
}

export interface MenuTreeOption {
  id: string | number;
  label: string;
  parentId: string | number;
  weight: number;
  menuType?: 'M' | 'C' | 'F' | string;
  visible?: string;
  status?: string;
  disabled?: boolean;
  children?: MenuTreeOption[];
}

export interface MenuVO extends BaseEntity {
  parentName?: string;
  parentId: string | number;
  children?: MenuVO[];
  menuId: string | number;
  menuName: string;
  orderNum: number;
  path: string;
  component?: string;
  queryParam?: string;
  isFrame?: string;
  isCache?: string;
  menuType: 'M' | 'C' | 'F' | string;
  visible?: string;
  status?: string;
  icon?: string | null;
  activeMenu?: string;
  ext?: string;
  perms?: string;
}
