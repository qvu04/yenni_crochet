import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Products, ProductPriceTier, ProductVariant } from "types";
import { resolveUnitPrice } from "utils/pricing";

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  variant_name?: string;
  variant_color_name?: string | null;
  variant_color_hex?: string | null;
  name: string;
  image?: string;
  base_price: number;
  price: number;
  price_tiers?: ProductPriceTier[];
  stock_quantity: number;
  quantity: number;
  note?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Products, quantity?: number, variant?: ProductVariant | null) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateNote: (itemId: string, note: string) => void;
  clearCart: () => void;
}

const getCartItemId = (productId: string, variantId?: string) =>
  variantId ? `${productId}:${variantId}` : productId;

const getVariantImages = (variant?: ProductVariant | null) => {
  if (!variant) return [];
  return variant.images?.filter((imageUrl) => Boolean(imageUrl.trim())) ?? [];
};

const toCartItem = (product: Products, quantity: number, variant?: ProductVariant | null): CartItem => {
  const variantImages = getVariantImages(variant);
  const stockQuantity = variant ? variant.stock_quantity : product.stock_quantity;
  const basePrice = variant?.price ?? product.price;
  const priceTiers = product.product_price_tiers ?? [];
  const safeQuantity = Math.max(1, Math.min(stockQuantity, quantity));
  const price = resolveUnitPrice({
    basePrice,
    priceTiers,
    quantity: safeQuantity,
    variantId: variant?.id,
  });

  return {
    id: getCartItemId(product.id, variant?.id),
    product_id: product.id,
    variant_id: variant?.id,
    variant_name: variant?.name,
    variant_color_name: variant?.color_name,
    variant_color_hex: variant?.color_hex,
    name: product.name,
    image: variantImages[0] ?? product.images?.[0],
    base_price: basePrice,
    price,
    price_tiers: priceTiers,
    stock_quantity: stockQuantity,
    quantity: safeQuantity,
  };
};

const getStoredCartItemId = (item: CartItem) =>
  item.id ?? getCartItemId(item.product_id, item.variant_id);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1, variant) =>
        set((state) => {
          const itemId = getCartItemId(product.id, variant?.id);
          const variantImages = getVariantImages(variant);
          const stockQuantity = variant ? variant.stock_quantity : product.stock_quantity;
          const basePrice = variant?.price ?? product.price;
          const priceTiers = product.product_price_tiers ?? [];
          const existingItem = state.items.find((item) => item.id === itemId);

          if (!existingItem) {
            return { items: [...state.items, toCartItem(product, quantity, variant)] };
          }

          return {
            items: state.items.map((item) =>
              getStoredCartItemId(item) === itemId
                ? (() => {
                  const nextQuantity = Math.min(stockQuantity, item.quantity + quantity);

                  return {
                    ...item,
                    id: itemId,
                    name: product.name,
                    variant_name: variant?.name,
                    variant_color_name: variant?.color_name,
                    variant_color_hex: variant?.color_hex,
                    image: variantImages[0] ?? product.images?.[0],
                    base_price: basePrice,
                    price: resolveUnitPrice({
                      basePrice,
                      priceTiers,
                      quantity: nextQuantity,
                      variantId: variant?.id,
                    }),
                    price_tiers: priceTiers,
                    stock_quantity: stockQuantity,
                    quantity: nextQuantity,
                  };
                })()
                : item,
            ),
          };
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => getStoredCartItemId(item) !== itemId),
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (getStoredCartItemId(item) !== itemId) return item;

            const nextQuantity = Math.max(1, Math.min(item.stock_quantity, quantity));
            const basePrice = item.base_price ?? item.price;

            return {
              ...item,
              id: itemId,
              base_price: basePrice,
              price: resolveUnitPrice({
                basePrice,
                priceTiers: item.price_tiers,
                quantity: nextQuantity,
                variantId: item.variant_id,
              }),
              quantity: nextQuantity,
            };
          }),
        })),
      updateNote: (itemId, note) =>
        set((state) => ({
          items: state.items.map((item) =>
            getStoredCartItemId(item) === itemId ? { ...item, id: itemId, note } : item,
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "yenni-crochet-cart",
    },
  ),
);

export const getCartTotalQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity, 0);

export const getCartSubtotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);
