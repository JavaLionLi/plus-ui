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
 * @param processInstanceId 流程实例id
 * @returns
 */
export const getListByKey = (key: string) => {
  return request({
    url: `/workflow/definition/getListByKey/${key}`,
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
 * @param deploymentId 部署id
 * @param definitionId 流程定义id
 * @returns
 */
export const deleteDefinition = (deploymentId: string | string[], definitionId: string | string[]) => {
  return request({
    url: `/workflow/definition/${deploymentId}/${definitionId}`,
    method: 'delete'
  });
};

/**
 * 挂起/激活
 * @param definitionId 流程定义id
 * @returns
 */
export const updateDefinitionState = (definitionId: string) => {
  return request({
    url: `/workflow/definition/updateDefinitionState/${definitionId}`,
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
export function deployProcessFile(data: any) {
  return request({
    url: '/workflow/definition/deployByFile',
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
