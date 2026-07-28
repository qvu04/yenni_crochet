export interface CreateOrderInput {
  product_id: string;
  quantity: number;
  customer_name: string;
  phone: string;
  address: string;
  note?: string;
  zalo_user_id?: string;
  promotion_id?: string;
}
