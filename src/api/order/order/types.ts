export interface OrderVO {
  /**
   * 订单id
   */
  orderId: string | number;

  /**
   * 商品id
   */
  productId: string | number;

  /**
   * 用户id
   */
  usrId: string | number;

  /**
   * 商品数量
   */
  productNum: number;

  /**
   * 订单状态
   */
  orderStatus: string;

  /**
   * 备注
   */
  orderRemark: string;

}

export interface OrderForm extends BaseEntity {
  /**
   * 订单id
   */
  orderId?: string | number;

  /**
   * 商品id
   */
  productId?: string | number;

  /**
   * 用户id
   */
  usrId?: string | number;

  /**
   * 商品数量
   */
  productNum?: number;

  /**
   * 订单状态
   */
  orderStatus?: string;

  /**
   * 备注
   */
  orderRemark?: string;

}

export interface OrderQuery extends PageQuery {

  /**
   * 订单id
   */
  orderId?: string | number;

  /**
   * 商品id
   */
  productId?: string | number;

  /**
   * 用户id
   */
  usrId?: string | number;

  /**
   * 商品数量
   */
  productNum?: number;

  /**
   * 订单状态
   */
  orderStatus?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



