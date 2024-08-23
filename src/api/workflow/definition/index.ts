import request from '@/utils/request';
import { definitionQuery, definitionVO, definitionXmlVO } from '@/api/workflow/definition/types';
import { AxiosPromise } from 'axios';

/**
 * 获取流程定义列表
 * @param query 流程实例id
 * @returns
 */
export const listDefinition = (query: definitionQuery): AxiosPromise<definitionVO[]> => {
  return request({
    url: `/workflow/definition/list`,
    method: 'get',
    params: query
  });
};
/**
 * 按照流程定义key获取流程定义
 * @param flowCode 流程编码
 * @returns
 */
export const getHisListByKey = (flowCode: string) => {
  return request({
    url: `/workflow/definition/getHisListByKey/${flowCode}`,
    method: 'get'
  });
};

/**
 * 通过流程定义id获取流程图
 */
export const definitionImage = (definitionId: string): AxiosPromise<any> => {
  return request({
    url: `/workflow/definition/definitionImage/${definitionId}` + '?t' + Math.random(),
    method: 'get'
  });
};

/**
 * 通过流程定义id获取xml
 * @param definitionId 流程定义id
 * @returns
 */
export const definitionXml = (definitionId: string): AxiosPromise<definitionXmlVO> => {
  return request({
    url: `/workflow/definition/definitionXml/${definitionId}`,
    method: 'get'
  });
};

/**
 * 删除流程定义
 * @param id 流程定义id
 * @returns
 */
export const deleteDefinition = (id: string | string[]) => {
  return request({
    url: `/workflow/definition/${id}`,
    method: 'delete'
  });
};

/**
 * 挂起/激活
 * @param definitionId 流程定义id
 * @returns
 */
export const updateDefinitionState = (definitionId: string, activityStatus: boolean) => {
  return request({
    url: `/workflow/definition/updateDefinitionState/${definitionId}/${activityStatus}`,
    method: 'put'
  });
};

/**
 * 流程定义转换为模型
 * @param definitionId 流程定义id
 * @returns
 */
export const convertToModel = (definitionId: string) => {
  return request({
    url: `/workflow/definition/convertToModel/${definitionId}`,
    method: 'put'
  });
};

/**
 * 通过zip或xml部署流程定义
 * @returns
 */
export function importDefinition(data: any) {
  return request({
    url: '/workflow/definition/importDefinition',
    method: 'post',
    data: data,
    headers: {
      repeatSubmit: false
    }
  });
}

/**
 * 迁移流程
 * @param currentdefinitionId
 * @param fromdefinitionId
 * @returns
 */
export const migrationDefinition = (currentdefinitionId: string, fromdefinitionId: string) => {
  return request({
    url: `/workflow/definition/migrationDefinition/${currentdefinitionId}/${fromdefinitionId}`,
    method: 'put'
  });
};

/**
 * 发布流程定义
 * @param id 流程定义id
 * @returns
 */
export const publish = (id: string) => {
  return request({
    url: `/workflow/definition/publish/${id}`,
    method: 'put'
  });
};

/**
 * 取消发布流程定义
 * @param id 流程定义id
 * @returns
 */
export const unPublish = (id: string) => {
  return request({
    url: `/workflow/definition/unPublish/${id}`,
    method: 'put'
  });
};
