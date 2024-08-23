import { DefinitionConfigVO } from '@/api/workflow/definitionConfig/types';
export interface ProcessDefinitionQuery extends PageQuery {
  key?: string;
  name?: string;
  categoryCode?: string;
  isPublish?: number;
}

export interface FlowDefinitionVo extends BaseEntity {
  id: string;
  flowName: string;
  flowCode: string;
  version: string;
  isPublish: number;
  activityStatus: boolean;
  createTime: Date;
  updateTime: Date;
  wfDefinitionConfigVo: DefinitionConfigVO;
}

export interface definitionXmlVO {
  xml: string[];
  xmlStr: string;
}
