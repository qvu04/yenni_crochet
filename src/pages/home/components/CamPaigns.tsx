import { Swiper } from "antd-mobile";
import styled from "styled-components";
import { useGetUpcomingCampaigns } from "queries/campaigns";
import { GiftIcon } from "components/icons";

const StyledSwiper = styled(Swiper)`
  --dot-color: rgba(51, 39, 42, 0.15);
  --active-dot-color: var(--color-primary);
  --dot-spacing: 6px;
  --track-padding: 0 0 20px;
`;

const BannerSlide = styled.div<{ $bg: string }>`
  position: relative;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-primary) url(${(p) => p.$bg}) center/cover no-repeat;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.55) 100%);
  }
`;

const BannerTitle = styled.p`
  position: absolute;
  bottom: 12px;
  left: 16px;
  z-index: 1;
  margin: 0;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
`;

export const CamPaigns = () => {
    const { data: campaigns, isLoading, isError } = useGetUpcomingCampaigns({});

    if (isLoading) {
        return (
            <div className="mx-5 mt-4 h-[140px] animate-pulse rounded-2xl bg-background-main" />
        );
    }

    if (isError || !campaigns || campaigns.length === 0) {
        return null;
    }

    return (
        <div className="mx-5 mt-4 flex flex-col gap-2">
            <h2 className="flex items-center gap-1.5 text-lg font-bold text-title-text">
                <GiftIcon className="h-8 w-8 text-title-text" />
                Sản phẩm theo sự kiện
            </h2>
            <StyledSwiper autoplay loop>
                {campaigns.map((campaign) => (
                    <Swiper.Item key={campaign.id}>
                        <BannerSlide $bg={campaign.banner_url}>
                            <BannerTitle>{campaign.name}</BannerTitle>
                        </BannerSlide>
                    </Swiper.Item>
                ))}
            </StyledSwiper>
        </div>
    );
};