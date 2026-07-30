import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const EmptyAccountIcon: React.FC<IconProps> = (props) => {
  const iconProps = useIconProps(props);

  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="h-24 w-24" fill="none" {...iconProps}>
      <circle cx="56" cy="56" r="44" fill="white" fillOpacity="0.78" />
      <circle cx="56" cy="42" r="14" fill="var(--color-primary)" />
      <path d="M32 82c3.4-14 12.2-22 24-22s20.6 8 24 22" fill="var(--color-primary)" fillOpacity="0.82" />
      <path d="M45 43c3 4 8 6 14 6M38 82h36" stroke="var(--color-text-main)" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M83 31v7M79.5 34.5h7M27 67v6M24 70h6" stroke="var(--color-primary-dark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
