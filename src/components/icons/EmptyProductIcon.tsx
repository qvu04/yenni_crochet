import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const EmptyProductIcon: React.FC<IconProps> = (props) => {
  const iconProps = useIconProps(props);

  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="h-24 w-24" fill="none" {...iconProps}>
      <circle cx="56" cy="56" r="44" fill="white" fillOpacity="0.78" />
      <path d="M33 48h46l-4 36H37L33 48Z" fill="var(--color-primary)" />
      <path d="M43 48c0-8 5.5-14 13-14s13 6 13 14" stroke="var(--color-text-main)" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.55" />
      <path d="M44 62h24M44 72h15" stroke="var(--color-text-main)" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.38" />
      <path d="M80 30l5-5M85 36h7M27 76l-5 5M27 84h-7" stroke="var(--color-primary-dark)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
