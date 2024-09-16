import { FlowTaskVO } from '@/api/workflow/task/types';

export interface ProcessInstanceQuery extends PageQuery {
  categoryCode?: string;
  flowCode?: string;
  createBy?: string;
  businessId?: string;
}

export interface ProcessInstanceVO extends BaseEntity {
  id: string;
  definitionId: string;
  flowNmae: string;
  flowCode: string;
  version: string;
  businessId: string;
  activityStatus?: any;
  tenantId: string;
  createTime: string;
  createBy: string;
  flowStatus: string;
  flowStatusName: string;
  flowTaskList: FlowTaskVO[];
}
