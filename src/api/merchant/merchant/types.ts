export interface MerchantVO {
  /**
   * 商户id
   */
  merchantId: string | number;

  /**
   * 负责人用户id
   */
  userId: string | number;

  /**
   * 商户等级
   */
  level: string;

  /**
   * 商户地址
   */
  merchantAddress: string;

  /**
   * 商户状态
   */
  merchantStatus: string;

}

export interface MerchantForm extends BaseEntity {
  /**
   * 商户id
   */
  merchantId?: string | number;

  /**
   * 负责人用户id
   */
  userId?: string | number;

  /**
   * 商户等级
   */
  level?: string;

  /**
   * 商户地址
   */
  merchantAddress?: string;

  /**
   * 商户状态
   */
  merchantStatus?: string;

}

export interface MerchantQuery extends PageQuery {

  /**
   * 商户id
   */
  merchantId?: string | number;

  /**
   * 负责人用户id
   */
  userId?: string | number;

  /**
   * 商户等级
   */
  level?: string;

  /**
   * 商户地址
   */
  merchantAddress?: string;

  /**
   * 商户状态
   */
  merchantStatus?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



