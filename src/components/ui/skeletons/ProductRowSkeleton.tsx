import { SkeletonBlock } from "./SkeletonBlock";

interface ProductRowSkeletonProps {
  count?: number;
}

export const ProductRowSkeleton = ({ count = 4 }: ProductRowSkeletonProps) => {
  return (
    <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="w-[38%] min-w-[150px] max-w-[176px] shrink-0">
          <SkeletonBlock className="aspect-square w-full rounded-[22px]" />
          <div className="mt-2 space-y-2 rounded-[22px] bg-white/60 p-3">
            <SkeletonBlock className="h-3.5 w-full rounded-full bg-background-main" />
            <SkeletonBlock className="h-3.5 w-3/4 rounded-full bg-background-main" />
            <SkeletonBlock className="h-4 w-20 rounded-full bg-background-main" />
          </div>
        </div>
      ))}
    </div>
  );
};
