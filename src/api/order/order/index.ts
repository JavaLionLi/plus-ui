import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrderVO, OrderForm, OrderQuery } from '@/api/order/order/types';

/**
 * 查询订单列表
 * @param query
 * @returns {*}
 */

export const listOrder = (query?: OrderQuery): AxiosPromise<OrderVO[]> => {
  return request({
    url: '/order/order/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询订单详细
 * @param orderId
 */
export const getOrder = (orderId: string | number): AxiosPromise<OrderVO> => {
  return request({
    url: '/order/order/' + orderId,
    method: 'get'
  });
};

/**
 * 新增订单
 * @param data
 */
export const addOrder = (data: OrderForm) => {
  return request({
    url: '/order/order',
    method: 'post',
    data: data
  });
};

/**
 * 修改订单
 * @param data
 */
export const updateOrder = (data: OrderForm) => {
  return request({
    url: '/order/order',
    method: 'put',
    data: data
  });
};

/**
 * 删除订单
 * @param orderId
 */
export const delOrder = (orderId: string | number | Array<string | number>) => {
  return request({
    url: '/order/order/' + orderId,
    method: 'delete'
  });
};
