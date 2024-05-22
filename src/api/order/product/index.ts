import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductVO, ProductForm, ProductQuery } from '@/api/order/product/types';

/**
 * 查询商品管理列表
 * @param query
 * @returns {*}
 */

export const listProduct = (query?: ProductQuery): AxiosPromise<ProductVO[]> => {
  return request({
    url: '/order/product/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询商品管理详细
 * @param productId
 */
export const getProduct = (productId: string | number): AxiosPromise<ProductVO> => {
  return request({
    url: '/order/product/' + productId,
    method: 'get'
  });
};

/**
 * 新增商品管理
 * @param data
 */
export const addProduct = (data: ProductForm) => {
  return request({
    url: '/order/product',
    method: 'post',
    data: data
  });
};

/**
 * 修改商品管理
 * @param data
 */
export const updateProduct = (data: ProductForm) => {
  return request({
    url: '/order/product',
    method: 'put',
    data: data
  });
};

/**
 * 删除商品管理
 * @param productId
 */
export const delProduct = (productId: string | number | Array<string | number>) => {
  return request({
    url: '/order/product/' + productId,
    method: 'delete'
  });
};
