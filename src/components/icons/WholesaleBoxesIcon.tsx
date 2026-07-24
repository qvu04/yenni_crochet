import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const WholesaleBoxesIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <rect x="13" y="47" width="34" height="34" rx="4" stroke="currentColor" strokeWidth="4" />
            <rect x="53" y="47" width="34" height="34" rx="4" stroke="currentColor" strokeWidth="4" />
            <rect x="33" y="14" width="34" height="34" rx="4" stroke="currentColor" strokeWidth="4" />
            <path
                d="M30 47 V59 M70 47 V59 M50 14 V26"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M25 81 H75"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
};
