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
   * 创建时间
   */
  createTime: string;

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
   * 创建时间
   */
  createTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



