import { SkeletonBlock } from "./SkeletonBlock";

interface VoucherListSkeletonProps {
  count?: number;
}

export const VoucherListSkeleton = ({ count = 2 }: VoucherListSkeletonProps) => {
  return (
    <div className="space-y-4 pb-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5">
          <SkeletonBlock className="h-44 w-full rounded-none bg-background-main" />
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-11 w-11 shrink-0 bg-primary/60" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-3/4 rounded-full bg-background-main" />
                <SkeletonBlock className="h-3.5 w-full rounded-full bg-background-main" />
              </div>
            </div>
            <SkeletonBlock className="h-20 w-full bg-background-main" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-7 w-24 rounded-full bg-background-main" />
              <SkeletonBlock className="h-7 w-32 rounded-full bg-background-main" />
            </div>
            <SkeletonBlock className="h-11 w-full bg-primary/60" />
          </div>
        </div>
      ))}
    </div>
  );
};
