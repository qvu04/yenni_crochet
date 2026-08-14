import { CreateOrderInput, CustomerOrder, CustomerOrderFilter } from "types";
import { supabase } from "./supabase";

const toCustomerOrder = (order: CustomerOrder): CustomerOrder => ({
  ...order,
  subtotal_price: Number(order.subtotal_price ?? 0),
  discount_amount: Number(order.discount_amount ?? 0),
  final_price: Number(order.final_price ?? 0),
  deposit_amount: Number(order.deposit_amount ?? 0),
  remaining_amount: Number(order.remaining_amount ?? 0),
  delivery_latitude: order.delivery_latitude == null ? null : Number(order.delivery_latitude),
  delivery_longitude: order.delivery_longitude == null ? null : Number(order.delivery_longitude),
  delivery_location_accuracy: order.delivery_location_accuracy == null ? null : Number(order.delivery_location_accuracy),
  items: (order.items ?? []).map((item) => ({
    ...item,
    quantity: Number(item.quantity ?? 0),
    unit_price: Number(item.unit_price ?? 0),
    total_price: Number(item.total_price ?? 0),
  })),
});

export const orderServices = {
  createOrder: async (input: CreateOrderInput): Promise<string | null> => {
    const rpcPayload = {
      p_customer_name: input.customer_name,
      p_phone: input.phone,
      p_address: input.address,
      p_note: input.note ?? null,
      p_zalo_user_id: input.zalo_user_id ?? null,
      p_promotion_id: input.promotion_id ?? null,
    };

    const { data, error } = input.items?.length
      ? await supabase.rpc("create_cart_order_with_promotion", {
        ...rpcPayload,
        p_items: input.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
          quantity: item.quantity,
          note: item.note ?? null,
        })),
        p_payment_type: input.payment_type ?? "deposit",
        p_payment_status: input.payment_status ?? "paid",
        p_deposit_rate: input.deposit_rate ?? null,
        p_deposit_amount: input.deposit_amount ?? 0,
        p_remaining_amount: input.remaining_amount ?? 0,
        p_checkout_order_id: input.checkout_order_id ?? null,
        p_checkout_transaction_id: input.checkout_transaction_id ?? null,
        p_checkout_message_token: input.checkout_message_token ?? null,
        p_delivery_latitude: input.delivery_latitude ?? null,
        p_delivery_longitude: input.delivery_longitude ?? null,
        p_delivery_location_accuracy: input.delivery_location_accuracy ?? null,
        p_delivery_location_token: input.delivery_location_token ?? null,
      })
      : await supabase.rpc("create_order_with_promotion", {
        ...rpcPayload,
        p_product_id: input.product_id,
        p_quantity: input.quantity,
      });

    if (error) {
      throw new Error(error.message);
    }

    return typeof data === "string" ? data : null;
  },

  getCustomerOrderHistory: async (zaloUserId: string, status: CustomerOrderFilter = "all"): Promise<CustomerOrder[]> => {
    const { data, error } = await supabase.rpc("get_user_order_history", {
      p_zalo_user_id: zaloUserId,
      p_status: status,
    });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as CustomerOrder[]).map(toCustomerOrder);
  },

  getCustomerOrderDetail: async (zaloUserId: string, orderId: string): Promise<CustomerOrder> => {
    const { data, error } = await supabase.rpc("get_user_order_detail", {
      p_zalo_user_id: zaloUserId,
      p_order_id: orderId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const order = (Array.isArray(data) ? data[0] : data) as CustomerOrder | null;

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    return toCustomerOrder(order);
  },
};
