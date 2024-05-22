import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MerchantVO, MerchantForm, MerchantQuery } from '@/api/merchant/merchant/types';

/**
 * 查询商户管理列表
 * @param query
 * @returns {*}
 */

export const listMerchant = (query?: MerchantQuery): AxiosPromise<MerchantVO[]> => {
  return request({
    url: '/merchant/merchant/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询商户管理详细
 * @param merchantId
 */
export const getMerchant = (merchantId: string | number): AxiosPromise<MerchantVO> => {
  return request({
    url: '/merchant/merchant/' + merchantId,
    method: 'get'
  });
};

/**
 * 新增商户管理
 * @param data
 */
export const addMerchant = (data: MerchantForm) => {
  return request({
    url: '/merchant/merchant',
    method: 'post',
    data: data
  });
};

/**
 * 修改商户管理
 * @param data
 */
export const updateMerchant = (data: MerchantForm) => {
  return request({
    url: '/merchant/merchant',
    method: 'put',
    data: data
  });
};

/**
 * 删除商户管理
 * @param merchantId
 */
export const delMerchant = (merchantId: string | number | Array<string | number>) => {
  return request({
    url: '/merchant/merchant/' + merchantId,
    method: 'delete'
  });
};
