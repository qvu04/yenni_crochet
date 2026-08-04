import { Products } from "./product";

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: Products;
}

export interface ToggleFavoriteInput {
  zaloUserId: string;
  productId: string;
}

export interface ToggleFavoriteResult {
  product_id: string;
  is_favorited: boolean;
}
