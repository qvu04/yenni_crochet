import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const AllProductsIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <rect x="16" y="18" width="27" height="27" rx="5" stroke="currentColor" strokeWidth="4" />
            <rect x="57" y="18" width="27" height="27" rx="5" stroke="currentColor" strokeWidth="4" />
            <rect x="16" y="57" width="27" height="27" rx="5" stroke="currentColor" strokeWidth="4" />
            <rect x="57" y="57" width="27" height="27" rx="5" stroke="currentColor" strokeWidth="4" />
            <path
                d="M29.5 31.5 H29.6 M70.5 31.5 H70.6 M29.5 70.5 H29.6 M70.5 70.5 H70.6"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
            />
        </svg>
    );
};
