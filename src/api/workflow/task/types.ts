import type { OssVO } from '@/api/system/oss/types';
import type { PageQuery } from '@/api/types';

export interface ButtonList {
  code: string;
  show: boolean;
}

export interface FlowCopyVo {
  userId: string | number;
  nickName: string;
}

export interface FlowHistoryVO {
  nodeName?: string;
  approverName?: string;
  flowStatus?: string;
  message?: string;
  createTime?: string;
  updateTime?: string;
  runDuration?: string;
  ext?: string | number;
  attachmentList?: OssVO[];
}

export interface FlowNextNodeVO {
  nodeCode: string;
  nodeName: string;
  permissionFlag?: string | Array<string | number>;
}

export interface FlowTaskVO {
  id: string | number;
  createTime?: string | Date;
  updateTime?: string | Date;
  tenantId?: string;
  definitionId?: string;
  instanceId?: string;
  flowName?: string;
  businessId: string;
  nodeCode?: string;
  nodeName?: string;
  flowCode?: string;
  flowStatus?: string;
  flowStatusName?: string;
  flowTaskStatus?: string;
  formCustom?: string;
  formPath?: string;
  nodeType?: number;
  nodeRatio?: string | number;
  version?: string;
  applyNode?: boolean;
  buttonList?: ButtonList[];
  copyList?: FlowCopyVo[];
  varList?: Record<string, string>;
  businessCode?: string;
  businessTitle?: string;
  categoryName?: string;
  createByName?: string;
  assigneeNames?: string;
  approverName?: string;
}

export interface StartWorkflowResult {
  taskId?: string | number;
}

export interface TaskOperationBo {
  taskId?: string | number;
  userId?: string | number;
  userIds?: Array<string | number>;
  message?: string;
  messageType?: string[];
  variables?: Record<string, unknown>;
}

export interface TaskQuery extends PageQuery {
  nodeName?: string;
  flowCode?: string;
  flowName?: string;
  createByIds?: Array<string | number>;
}
