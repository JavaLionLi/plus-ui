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

export interface TaskVO extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  priority: number;
  owner?: string;
  assignee?: string | number;
  assigneeName?: string;
  processInstanceId: string;
  executionId: string;
  taskDefinitionId?: any;
  processDefinitionId: string;
  endTime?: string;
  taskDefinitionKey: string;
  dueDate?: string;
  category?: any;
  parentTaskId?: any;
  tenantId: string;
  claimTime?: string;
  businessStatus: string;
  businessStatusName: string;
  processDefinitionName: string;
  processDefinitionKey: string;
  participantVo: ParticipantVo;
  multiInstance: boolean;
}

export interface VariableVo {
  key: string;
  value: string;
}