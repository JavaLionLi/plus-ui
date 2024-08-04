import { NodeConfigVO } from '@/api/workflow/nodeConfig/types';
import { DefinitionConfigVO } from '@/api/workflow/definitionConfig/types';
export interface TaskQuery extends PageQuery {
  name?: string;
  processDefinitionKey?: string;
  processDefinitionName?: string;
}

export interface ParticipantVo {
  groupIds?: string[] | number[];
  candidate: string[] | number[];
  candidateName: string[];
  claim: boolean;
}
export interface FlowTaskVO {
  id: string | number;
  createTime?: Date;
  updateTime?: Date;
  tenantId?: string;
  definitionId?: string;
  instanceId: string;
  flowName: string;
  businessId: string;
  nodeCode: string;
  nodeName: string;
  flowCode: string;
  flowStatus: string;
  nodeType: number;
  wfNodeConfigVo?: NodeConfigVO;
  wfDefinitionConfigVo?: DefinitionConfigVO;
}

export interface VariableVo {
  key: string;
  value: string;
}
