import { create } from "zustand";

interface CampaignSheetState {
  selectedCampaignId: string | null;
  openCampaign: (id: string) => void;
  closeCampaign: () => void;
}

export const useCampaignSheetStore = create<CampaignSheetState>((set) => ({
  selectedCampaignId: null,
  openCampaign: (id) => set({ selectedCampaignId: id }),
  closeCampaign: () => set({ selectedCampaignId: null }),
}));
