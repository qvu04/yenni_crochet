import { SkeletonBlock } from "./SkeletonBlock";

interface PromotionPickerSkeletonProps {
  count?: number;
  itemClassName?: string;
}

export const PromotionPickerSkeleton = ({
  count = 2,
  itemClassName = "bg-background-main",
}: PromotionPickerSkeletonProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`rounded-2xl p-3 ${itemClassName}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-28 rounded-full bg-white" />
              <SkeletonBlock className="h-3 w-40 rounded-full bg-white" />
            </div>
            <SkeletonBlock className="h-7 w-20 rounded-full bg-white" />
          </div>
        </div>
      ))}
    </div>
  );
};
