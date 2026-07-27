import { useGetCampaignById } from "queries";
import { useCampaignSheetStore } from "stores/campaignSheet";
import { CampaignDetailSheet } from "./CampaignDetailSheet";

export const CampaignSheet = () => {
  const selectedCampaignId = useCampaignSheetStore((s) => s.selectedCampaignId);
  const closeCampaign = useCampaignSheetStore((s) => s.closeCampaign);
  const { data: campaign, isLoading, isError } = useGetCampaignById({
    id: selectedCampaignId ?? undefined,
  });

  return (
    <CampaignDetailSheet
      campaign={campaign ?? null}
      visible={Boolean(selectedCampaignId)}
      onClose={closeCampaign}
      isLoading={isLoading}
      isError={isError}
    />
  );
};
