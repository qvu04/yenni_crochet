import { supabase } from "./supabase";
import { Campaign } from "types";

export const campaignServices = {
  // Banner đầu = campaign gần nhất (đang diễn ra hoặc sắp tới), banner sau = campaign kế tiếp.
  // Lọc end_date >= hôm nay để bỏ qua campaign đã qua, sắp theo start_date tăng dần, lấy 2.
  getUpcomingCampaigns: async (): Promise<Campaign[]> => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .gte("end_date", today)
      .order("start_date", { ascending: true })
      .limit(2);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
