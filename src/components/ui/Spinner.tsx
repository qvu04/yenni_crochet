import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface SpinnerProps {
  label?: string;
  className?: string;
}

export const Spinner = ({ label = "Đang tải...", className = "" }: SpinnerProps) => {
  return (
    <div className={`flex min-h-32 flex-col items-center justify-center gap-3 ${className}`}>
      <AiOutlineLoading3Quarters className="h-9 w-9 animate-spin text-title-text" />
      {label && <p className="text-sm font-semibold text-text-muted">{label}</p>}
    </div>
  );
};
