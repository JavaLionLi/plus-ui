import type { BaseEntity, PageQuery } from '@/api/types';

export interface DbColumnVO extends BaseEntity {
  columnId?: string | number;
  tableId?: string | number;
  columnName?: string;
  columnComment?: string;
  columnType?: string;
  javaType?: string;
  javaField?: string;
  isPk?: string;
  isIncrement?: string;
  isRequired?: string;
  isInsert?: string;
  isEdit?: string;
  isList?: string;
  isQuery?: string;
  queryType?: string;
  htmlType?: string;
  dictType?: string;
  sort?: number;
  increment?: boolean;
  capJavaField?: string;
  usableColumn?: boolean;
  superColumn?: boolean;
  list?: boolean;
  pk?: boolean;
  insert?: boolean;
  edit?: boolean;
  query?: boolean;
  required?: boolean;
}

export interface DbTableQuery extends PageQuery {
  dataName?: string;
  tableName?: string;
  tableComment?: string;
}

export interface DbTableVO extends Omit<TableVO, 'tableId'> {
  tableId?: string | number;
  columns?: DbColumnVO[];
  options?: string;
  remark?: string;
  treeCode?: string;
  treeParentCode?: string;
  treeName?: string;
  menuIds?: Array<string | number>;
  parentMenuId?: string | number;
  parentMenuName?: string;
  enableExport?: boolean;
  enableStatus?: boolean;
  statusField?: string;
  enableUnique?: boolean;
  uniqueFields?: string[];
  enableSort?: boolean;
  sortField?: string;
  frontendType?: string;
  treeRootValue?: string;
  treeAncestorsField?: string;
  treeOrderField?: string;
}

export interface GenTableDetailPayload {
  info: DbTableVO;
  rows: DbColumnVO[];
}

export interface TableQuery extends PageQuery {
  tableName?: string;
  tableComment?: string;
  dataName?: string;
}

export interface TableVO extends BaseEntity {
  createDept?: number | string;
  tableId: string | number;
  dataName?: string;
  tableName: string;
  tableComment?: string;
  className?: string;
  tplCategory?: string;
  frontendType?: string;
  packageName?: string;
  moduleName?: string;
  businessName?: string;
  functionName?: string;
  functionAuthor?: string;
  tree?: boolean;
  crud?: boolean;
}
