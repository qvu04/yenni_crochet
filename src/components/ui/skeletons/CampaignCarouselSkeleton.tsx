import { GiftIcon } from "components/icons";
import { SkeletonBlock } from "./SkeletonBlock";

export const CampaignCarouselSkeleton = () => {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex items-center gap-1.5 text-lg font-bold text-title-text">
        <GiftIcon className="h-8 w-8 text-title-text" />
        Sản phẩm theo sự kiện
      </h2>
      <SkeletonBlock className="h-[250px] w-full rounded-2xl" />
    </section>
  );
};
