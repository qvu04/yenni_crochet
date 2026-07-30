import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const EmptyCartIcon: React.FC<IconProps> = (props) => {
  const iconProps = useIconProps(props);

  return (
    <svg viewBox="0 0 112 112" aria-hidden="true" className="h-24 w-24" fill="none" {...iconProps}>
      <circle cx="56" cy="56" r="44" fill="white" fillOpacity="0.78" />
      <path d="M30 34h8l7 34h31l7-24H43" stroke="var(--color-text-main)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.55" />
      <path d="M48 56h24" stroke="var(--color-primary-dark)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="78" r="5" fill="var(--color-primary)" />
      <circle cx="73" cy="78" r="5" fill="var(--color-primary)" />
      <path d="M59 28c5-6 15-3 15 5 0 9-15 16-15 16S44 42 44 33c0-8 10-11 15-5Z" fill="var(--color-primary)" fillOpacity="0.88" />
    </svg>
  );
};
