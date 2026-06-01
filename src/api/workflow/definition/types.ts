import type { PageQuery } from '@/api/types';

export interface FlowDefinitionForm {
  id?: string;
  flowName?: string;
  flowCode?: string;
  category?: string | number;
  ext?: string;
  formPath?: string;
  formCustom?: string;
  modelValue?: string;
}

export interface FlowDefinitionQuery extends PageQuery {
  flowCode?: string;
  flowName?: string;
  category?: string | number;
  isPublish?: number;
}

export interface FlowDefinitionVO {
  id: string;
  flowName: string;
  flowCode: string;
  category?: string | number;
  categoryName?: string;
  formPath?: string;
  formCustom?: string;
  modelValue?: string;
  version?: string | number;
  isPublish?: number;
  activityStatus?: number;
  ext?: string;
  createTime?: string | Date;
  updateTime?: string | Date;
}

export type FlowDefinitionVo = FlowDefinitionVO;

export interface definitionXmlVO {
  xml: string[];
  xmlStr: string;
}
