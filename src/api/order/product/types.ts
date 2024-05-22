export interface ProductVO {
  /**
   * 商品id
   */
  productId: string | number;

  /**
   * 商品名称
   */
  productName: string;

  /**
   * 商品规格
   */
  productSpecification: string;

  /**
   * 商品单价
   */
  productPrice: number;

  /**
   * 备注
   */
  productRemarks: string;

}

export interface ProductForm extends BaseEntity {
  /**
   * 商品id
   */
  productId?: string | number;

  /**
   * 商品名称
   */
  productName?: string;

  /**
   * 商品规格
   */
  productSpecification?: string;

  /**
   * 商品单价
   */
  productPrice?: number;

  /**
   * 备注
   */
  productRemarks?: string;

}

export interface ProductQuery extends PageQuery {

  /**
   * 商品id
   */
  productId?: string | number;

  /**
   * 商品名称
   */
  productName?: string;

  /**
   * 商品规格
   */
  productSpecification?: string;

  /**
   * 商品单价
   */
  productPrice?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



