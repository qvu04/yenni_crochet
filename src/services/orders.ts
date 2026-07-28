import { CreateOrderInput } from "types";
import { supabase } from "./supabase";

export const orderServices = {
  createOrder: async (input: CreateOrderInput): Promise<void> => {
    const { error } = await supabase.rpc("create_order_with_promotion", {
      p_product_id: input.product_id,
      p_quantity: input.quantity,
      p_customer_name: input.customer_name,
      p_phone: input.phone,
      p_address: input.address,
      p_note: input.note ?? null,
      p_zalo_user_id: input.zalo_user_id ?? null,
      p_promotion_id: input.promotion_id ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
};
