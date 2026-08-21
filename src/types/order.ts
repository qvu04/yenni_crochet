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
  shipping_fee?: number;
  checkout_order_id?: string;
  checkout_transaction_id?: string;
  checkout_message_token?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_location_accuracy?: number;
  delivery_location_token?: string;
}

export type OrderPaymentType = "deposit" | "full" | "none";

export type CustomerOrderStatus =
  | "pending"
  | "awaiting_confirmation"
  | "confirmed"
  | "making"
  | "shipping"
  | "delivering"
  | "done"
  | "completed"
  | "cancelled"
  | "canceled";

export type CustomerOrderFilter =
  | "all"
  | "waiting_payment"
  | "paid_deposit"
  | CustomerOrderStatus;

export interface CustomerOrderItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  variant_name?: string | null;
  variant_color_name?: string | null;
  variant_image?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  note?: string | null;
  product_name?: string | null;
  product_image?: string | null;
}

export interface CustomerOrder {
  id: string;
  created_at: string;
  status: CustomerOrderStatus;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_type: "deposit" | "full" | "none";
  customer_name: string;
  phone: string;
  address: string;
  note?: string | null;
  subtotal_price: number;
  discount_amount: number;
  final_price: number;
  shipping_fee: number;
  deposit_amount: number;
  remaining_amount: number;
  paid_at?: string | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_location_accuracy?: number | null;
  delivery_location_token?: string | null;
  items: CustomerOrderItem[];
}
