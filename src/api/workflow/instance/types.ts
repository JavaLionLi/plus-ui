import type { BaseEntity, PageQuery } from '@/api/types';
import type { FlowHistoryVO, FlowTaskVO } from '@/api/workflow/task/types';

export interface FlowHisTaskResult {
  list: FlowHistoryVO[];
  instanceId?: string | number;
}

export interface FlowInstanceQuery extends PageQuery {
  category?: string | number;
  nodeName?: string;
  flowCode?: string;
  flowName?: string;
  createByIds?: Array<string | number>;
  businessId?: string;
}

export interface FlowInstanceVO extends BaseEntity {
  id: string | number;
  definitionId?: string;
  flowName?: string;
  flowCode?: string;
  version?: string | number;
  businessId: string;
  activityStatus?: number;
  tenantId?: string;
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  createByName?: string;
  flowStatus?: string;
  flowStatusName?: string;
  flowTaskList?: FlowTaskVO[];
  businessCode?: string;
  businessTitle?: string;
  nodeName?: string;
  categoryName?: string;
  isSuspended?: boolean;
  formCustom?: string;
  formPath?: string;
}
