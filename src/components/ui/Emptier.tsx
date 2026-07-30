import { EmptyIconDefault } from "components/icons";
import { ReactNode } from "react";

interface EmptierAction {
  label: string;
  onClick: () => void;
}

interface EmptierProps {
  title?: string;
  description?: string;
  action?: EmptierAction;
  className?: string;
  icon?: ReactNode;
  compact?: boolean;
}

export const Emptier = ({
  title = "Chưa có nội dung",
  description = "Bạn quay lại sau một chút nhé.",
  action,
  className = "",
  icon,
  compact,
}: EmptierProps) => {
  const minHeightClassName = compact
    ? "min-h-40"
    : "min-h-[calc(100dvh-260px-var(--zaui-safe-area-inset-bottom,0px))]";

  return (
    <div className={`flex ${minHeightClassName} flex-col items-center justify-center px-6 py-8 text-center ${className}`}>
      {icon ?? <EmptyIconDefault />}
      <h3 className="mt-3 font-heading text-lg font-bold text-title-text">{title}</h3>
      {description && (
        <p className="mt-1 max-w-[280px] text-sm leading-6 text-text-muted">{description}</p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-text-main"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
