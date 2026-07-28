import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface SpinnerProps {
  label?: string;
  className?: string;
  variant?: "default" | "inline";
}

export const Spinner = ({ label = "Đang tải...", className = "", variant = "default" }: SpinnerProps) => {
  if (variant === "inline") {
    return (
      <span className={`inline-flex items-center justify-center gap-2 leading-none ${className}`}>
        <AiOutlineLoading3Quarters className="h-4 w-4 shrink-0 animate-spin" />
        {label && <span className="text-base font-bold">{label}</span>}
      </span>
    );
  }

  return (
    <div className={`flex min-h-32 flex-col items-center justify-center gap-3 ${className}`}>
      <AiOutlineLoading3Quarters className="h-9 w-9 animate-spin text-title-text" />
      {label && <p className="text-sm font-semibold text-text-muted">{label}</p>}
    </div>
  );
};
