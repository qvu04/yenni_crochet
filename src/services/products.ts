import { Products, ProductType } from "types";
import { supabase } from "./supabase";

interface GetProductsListInput {
  productType?: ProductType;
  preOrder?: boolean;
}

export const productServices = {

  getProductById: async (id: string): Promise<Products> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
  getActiveProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  getProductsByType: async (productType: ProductType): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("product_type", productType)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  getPreOrderProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_pre_order", true)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  getProductsList: async ({ productType, preOrder }: GetProductsListInput): Promise<Products[]> => {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (preOrder) {
      query = query.eq("is_pre_order", true);
    } else if (productType) {
      query = query.eq("product_type", productType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};
