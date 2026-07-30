import { create } from "zustand";

interface RectSnapshot {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface FlyToCartPayload {
  src: string;
  alt: string;
  startRect: RectSnapshot;
}

interface FlyToCartState extends FlyToCartPayload {
  id: number;
}

interface FlyToCartStore {
  flyToCart: FlyToCartState | null;
  triggerFlyToCart: (payload: FlyToCartPayload) => void;
  clearFlyToCart: () => void;
}

export const useFlyToCartStore = create<FlyToCartStore>((set) => ({
  flyToCart: null,
  triggerFlyToCart: (payload) =>
    set({
      flyToCart: {
        ...payload,
        id: Date.now(),
      },
    }),
  clearFlyToCart: () => set({ flyToCart: null }),
}));
