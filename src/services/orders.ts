import { CreateOrderInput } from "types";
import { supabase } from "./supabase";

export const orderServices = {
  createOrder: async (input: CreateOrderInput): Promise<void> => {
    const rpcPayload = {
      p_customer_name: input.customer_name,
      p_phone: input.phone,
      p_address: input.address,
      p_note: input.note ?? null,
      p_zalo_user_id: input.zalo_user_id ?? null,
      p_promotion_id: input.promotion_id ?? null,
    };

    const { error } = input.items?.length
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
  },
};
