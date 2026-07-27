import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { campaignServices } from "services";
import { Campaign } from "types";

interface UseGetUpcomingCampaigns {
  options?: UseQueryOptions<Campaign[], Error>;
}
interface UseGetCampaignById {
  id?: string;
  options?: UseQueryOptions<Campaign, Error>;
}

export const useGetUpcomingCampaigns = ({ options }: UseGetUpcomingCampaigns) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_UPCOMING_CAMPAIGNS],
    queryFn: async () => {
      const res = await campaignServices.getUpcomingCampaigns();
      return res;
    },
    ...options,
  });
};

export const useGetCampaignById = ({ id, options }: UseGetCampaignById) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_CAMPAIGN_BY_ID, id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Thiếu campaign id");
      }

      return campaignServices.getCampaignById(id);
    },
    enabled: !!id,
    ...options,
  });
};
