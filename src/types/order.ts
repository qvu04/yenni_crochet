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
  payment_type?: "deposit" | "full" | "none";
  payment_status?: "pending" | "paid" | "failed" | "refunded";
  deposit_rate?: number;
  deposit_amount?: number;
  remaining_amount?: number;
  checkout_order_id?: string;
  checkout_transaction_id?: string;
  checkout_message_token?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_location_accuracy?: number;
  delivery_location_token?: string;
}
