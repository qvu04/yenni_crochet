import { ToggleFavoriteInput, ToggleFavoriteResult, WishlistItem } from "types";
import { supabase } from "./supabase";

export const wishlistServices = {
  getUserWishlist: async (zaloUserId: string): Promise<WishlistItem[]> => {
    const { data, error } = await supabase.rpc("get_user_wishlist", {
      p_zalo_user_id: zaloUserId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as WishlistItem[];
  },

  isProductFavorited: async ({ zaloUserId, productId }: ToggleFavoriteInput): Promise<boolean> => {
    const { data, error } = await supabase.rpc("is_product_favorited", {
      p_zalo_user_id: zaloUserId,
      p_product_id: productId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return Boolean(data);
  },

  toggleFavoriteProduct: async (input: ToggleFavoriteInput): Promise<ToggleFavoriteResult> => {
    const { data, error } = await supabase.rpc("toggle_favorite_product", {
      p_zalo_user_id: input.zaloUserId,
      p_product_id: input.productId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (Array.isArray(data) ? data[0] : data) as ToggleFavoriteResult;
  },
};
