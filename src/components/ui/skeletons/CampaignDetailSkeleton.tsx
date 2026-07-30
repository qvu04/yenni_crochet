import { CloseButtonSheet } from "components/ui/CloseButtonSheet";
import { SkeletonBlock } from "./SkeletonBlock";

interface CampaignDetailSkeletonProps {
  onClose: () => void;
}

export const CampaignDetailSkeleton = ({ onClose }: CampaignDetailSkeletonProps) => {
  return (
    <div className="relative h-full bg-background-main">
      <CloseButtonSheet onClick={onClose} />
      <SkeletonBlock className="h-72 w-full rounded-none" />
      <div className="space-y-4 px-5 pt-5">
        <div className="flex gap-2">
          <SkeletonBlock className="h-7 w-24 rounded-full bg-white" />
          <SkeletonBlock className="h-7 w-32 rounded-full bg-white" />
        </div>
        <SkeletonBlock className="h-5 w-4/5 rounded-full bg-white" />
        <SkeletonBlock className="h-4 w-2/3 rounded-full bg-white" />
        <SkeletonBlock className="h-28 w-full bg-white" />
        <SkeletonBlock className="h-36 w-full bg-white" />
      </div>
    </div>
  );
};
