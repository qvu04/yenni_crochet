import { CreateOrderInput } from "types";
import { supabase } from "./supabase";

export const orderServices = {
  createOrder: async (input: CreateOrderInput): Promise<void> => {
    const { error } = await supabase.from("orders").insert(input);

    if (error) {
      throw new Error(error.message);
    }
  },
};
