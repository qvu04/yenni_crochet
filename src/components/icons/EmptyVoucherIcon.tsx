import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const EmptyVoucherIcon: React.FC<IconProps> = (props) => {
  const iconProps = useIconProps(props);

  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="h-24 w-24" fill="none" {...iconProps}>
      <circle cx="56" cy="56" r="44" fill="white" fillOpacity="0.78" />
      <path d="M28 43c0-4.4 3.6-8 8-8h40c4.4 0 8 3.6 8 8v8c-4.4 0-8 3.6-8 8s3.6 8 8 8v8c0 4.4-3.6 8-8 8H36c-4.4 0-8-3.6-8-8v-8c4.4 0 8-3.6 8-8s-3.6-8-8-8v-8Z" fill="var(--color-primary)" />
      <path d="M51 41v36" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 7" />
      <path d="M62 49h8M62 61h12M62 73h7" stroke="var(--color-text-main)" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.45" />
      <circle cx="40" cy="52" r="3.5" fill="var(--color-text-main)" fillOpacity="0.45" />
      <circle cx="42" cy="69" r="3.5" fill="var(--color-text-main)" fillOpacity="0.35" />
      <path d="M82 25v8M78 29h8M25 33v6M22 36h6" stroke="var(--color-primary-dark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
