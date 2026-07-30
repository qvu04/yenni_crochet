export interface CreateOrderItemInput {
  product_id: string;
  variant_id?: string;
  quantity: number;
  note?: string;
}

export interface CreateOrderInput {
  product_id?: string;
  quantity?: number;
  items?: CreateOrderItemInput[];
  customer_name: string;
  phone: string;
  address: string;
  note?: string;
  zalo_user_id?: string;
  promotion_id?: string;
}
