interface SkeletonBlockProps {
  className?: string;
}

export const SkeletonBlock = ({ className = "" }: SkeletonBlockProps) => {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/70 ${className}`} />
  );
};
