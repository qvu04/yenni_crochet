import { CloseButtonSheet } from "components/ui/CloseButtonSheet";
import { SkeletonBlock } from "./SkeletonBlock";

interface ProductDetailSkeletonProps {
  onClose: () => void;
}

export const ProductDetailSkeleton = ({ onClose }: ProductDetailSkeletonProps) => {
  return (
    <div className="relative h-full bg-background-main">
      <CloseButtonSheet onClick={onClose} />
      <SkeletonBlock className="h-72 w-full rounded-none" />
      <div className="space-y-4 px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-5 w-4/5 rounded-full bg-white" />
            <SkeletonBlock className="h-4 w-28 rounded-full bg-white" />
          </div>
          <SkeletonBlock className="h-7 w-20 rounded-full bg-white" />
        </div>
        <SkeletonBlock className="h-24 w-full bg-white" />
        <SkeletonBlock className="h-36 w-full bg-white" />
      </div>
    </div>
  );
};
