import { supabase } from "./supabase";
import { Campaign, Products } from "types";

interface CampaignProductRelation {
  products?: Products | Products[] | null;
}

type CampaignResponse = Omit<Campaign, "products"> & {
  campaign_products?: CampaignProductRelation[] | null;
};

const normalizeCampaign = (campaign: CampaignResponse): Campaign => {
  const products = campaign.campaign_products
    ?.reduce<Products[]>((items, item) => {
      if (!item.products) return items;
      return items.concat(Array.isArray(item.products) ? item.products : [item.products]);
    }, []) ?? [];

  const { campaign_products: _campaignProducts, ...rest } = campaign;

  return {
    ...rest,
    products,
  };
};

export const campaignServices = {
  getUpcomingCampaigns: async (): Promise<Campaign[]> => {
    const today = new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("campaigns")
      .select("*, campaign_products(products(*, product_price_tiers(*)))")
      .eq("is_active", true)
      .gte("end_date", today)
      .order("start_date", { ascending: true })
      .limit(2);

    if (error) {
      throw new Error(error.message);
    }

    return (data as CampaignResponse[]).map(normalizeCampaign);
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, campaign_products(products(*, product_price_tiers(*)))")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeCampaign(data as CampaignResponse);
  },
};
