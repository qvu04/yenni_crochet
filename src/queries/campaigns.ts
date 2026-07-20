import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { campaignServices } from "services";
import { Campaign } from "types";

interface UseGetUpcomingCampaigns {
  options?: UseQueryOptions<Campaign[], Error>;
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
