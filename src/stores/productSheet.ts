import { create } from "zustand";

interface ProductSheetState {
  selectedProductId: string | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;
}

export const useProductSheetStore = create<ProductSheetState>((set) => ({
  selectedProductId: null,
  openProduct: (id) => set({ selectedProductId: id }),
  closeProduct: () => set({ selectedProductId: null }),
}));
