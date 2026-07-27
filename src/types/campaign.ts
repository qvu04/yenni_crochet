import { Products } from "./product";

export type CampaignType = "collection" | "event" | "promotion";
export type CampaignCtaAction = "products" | "contact" | "custom_request";

export interface Campaign {
  id: string;
  name: string;
  banner_url: string;
  start_date: string;
  end_date: string;
  campaign_type?: CampaignType | null;
  subtitle?: string | null;
  description?: string | null;
  content?: string | null;
  detail_image_url?: string | null;
  event_location?: string | null;
  start_at?: string | null;
  end_at?: string | null;
  cta_label?: string | null;
  cta_action?: CampaignCtaAction | null;
  is_active?: boolean | null;
  products?: Products[];
}
