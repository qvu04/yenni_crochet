import { Swiper } from "antd-mobile";
import styled from "styled-components";
import { useGetUpcomingCampaigns } from "queries/campaigns";
import { GiftIcon } from "components/icons";
import { useCampaignSheetStore } from "stores/campaignSheet";

const StyledSwiper = styled(Swiper)`
  --dot-color: rgba(51, 39, 42, 0.15);
  --active-dot-color: var(--color-primary);
  --dot-spacing: 6px;
  --track-padding: 0 0 20px;
`;

const BannerSlide = styled.button<{ $bg: string }>`
  position: relative;
  display: block;
  width: 100%;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-primary) url(${(p) => p.$bg}) center/cover no-repeat;
  border: 0;
  padding: 0;
  text-align: left;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.55) 100%);
  }
`;

const BannerContent = styled.div`
  position: absolute;
  right: 16px;
  bottom: 12px;
  left: 16px;
  z-index: 1;
`;

const BannerTitle = styled.p`
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
`;

const BannerDescription = styled.p`
  display: -webkit-box;
  margin: 4px 0 0;
  overflow: hidden;
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

export const CamPaigns = () => {
    const { data: campaigns, isLoading, isError } = useGetUpcomingCampaigns({});
    const openCampaign = useCampaignSheetStore((s) => s.openCampaign);

    if (isLoading) {
        return (
            <div className="h-[140px] animate-pulse rounded-2xl bg-white/65" />
        );
    }

    if (isError || !campaigns || campaigns.length === 0) {
        return null;
    }

    return (
        <section className="flex flex-col gap-2">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-title-text">
                <GiftIcon className="h-8 w-8 text-title-text" />
                Sản phẩm theo sự kiện
            </h2>
            <StyledSwiper autoplay loop>
                {campaigns.map((campaign) => (
                    <Swiper.Item key={campaign.id}>
                        <BannerSlide
                            type="button"
                            $bg={campaign.banner_url}
                            onClick={() => openCampaign(campaign.id)}
                        >
                            <BannerContent>
                                <BannerTitle>{campaign.name}</BannerTitle>
                                {(campaign.subtitle || campaign.description) && (
                                    <BannerDescription>
                                        {campaign.subtitle || campaign.description}
                                    </BannerDescription>
                                )}
                            </BannerContent>
                        </BannerSlide>
                    </Swiper.Item>
                ))}
            </StyledSwiper>
        </section>
    );
};
