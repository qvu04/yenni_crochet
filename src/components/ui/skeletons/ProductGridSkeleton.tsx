import { SkeletonBlock } from "./SkeletonBlock";

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton = ({ count = 6 }: ProductGridSkeletonProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 pb-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[22px] bg-white shadow-[0_10px_24px_rgba(51,39,42,0.06)] ring-1 ring-text-main/5">
          <SkeletonBlock className="aspect-square w-full rounded-none bg-background-main" />
          <div className="space-y-2 p-3">
            <SkeletonBlock className="h-3.5 w-full rounded-full bg-background-main" />
            <SkeletonBlock className="h-3.5 w-4/5 rounded-full bg-background-main" />
            <SkeletonBlock className="h-4 w-24 rounded-full bg-background-main" />
            <SkeletonBlock className="h-3 w-16 rounded-full bg-background-main" />
          </div>
        </div>
      ))}
    </div>
  );
};
