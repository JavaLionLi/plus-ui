import { DefinitionConfigVO } from '@/api/workflow/definitionConfig/types';
export interface ProcessDefinitionQuery extends PageQuery {
  key?: string;
  name?: string;
  categoryCode?: string;
}

export interface FlowDefinitionVo extends BaseEntity {
  id: string;
  flowName: string;
  flowCode: string;
  version: string;
  isPublish: number;
  createTime: Date;
  updateTime: Date;
  wfDefinitionConfigVo: DefinitionConfigVO;
}

export interface definitionXmlVO {
  xml: string[];
  xmlStr: string;
}
