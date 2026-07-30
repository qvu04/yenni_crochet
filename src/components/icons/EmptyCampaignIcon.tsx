import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const EmptyCampaignIcon: React.FC<IconProps> = (props) => {
  const iconProps = useIconProps(props);

  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="h-20 w-20" fill="none" {...iconProps}>
      <circle cx="56" cy="56" r="42" fill="white" fillOpacity="0.78" />
      <path d="M35 38h42v39c0 4.4-3.6 8-8 8H43c-4.4 0-8-3.6-8-8V38Z" fill="var(--color-primary)" />
      <path d="M35 47h42M46 30v14M66 30v14" stroke="var(--color-text-main)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.42" />
      <path d="M48 60h16M48 71h10" stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M80 24l5-5M86 31h7M28 82l-5 5" stroke="var(--color-primary-dark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
