import { Products, ProductPriceTier, ProductType, ProductVariant } from "types";
import { supabase } from "./supabase";

interface GetProductsListInput {
  productType?: ProductType;
  preOrder?: boolean;
}

const PRODUCT_LIST_SELECT = "*, product_price_tiers(*)";

export const productServices = {

  getProductById: async (id: string): Promise<Products> => {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (productError) {
      throw new Error(productError.message);
    }

    const [
      { data: variants, error: variantsError },
      { data: priceTiers, error: priceTiersError },
    ] = await Promise.all([
      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_price_tiers")
        .select("*")
        .eq("product_id", id)
        .eq("is_active", true)
        .order("min_quantity", { ascending: true }),
    ]);

    if (variantsError) {
      throw new Error(variantsError.message);
    }

    if (priceTiersError) {
      throw new Error(priceTiersError.message);
    }

    return {
      ...product,
      product_variants: variants as ProductVariant[],
      product_price_tiers: priceTiers as ProductPriceTier[],
    };
  },
  getActiveProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
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
      .select(PRODUCT_LIST_SELECT)
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
      .select(PRODUCT_LIST_SELECT)
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
      .select(PRODUCT_LIST_SELECT)
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
