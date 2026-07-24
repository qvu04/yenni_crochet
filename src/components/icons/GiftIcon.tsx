import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const GiftIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);
    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <rect x="20" y="45" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="3" />
            <rect x="15" y="32" width="70" height="15" rx="3" stroke="currentColor" strokeWidth="3" />
            <line x1="50" y1="47" x2="50" y2="85" stroke="currentColor" strokeWidth="3" />
            <line x1="50" y1="32" x2="50" y2="47" stroke="currentColor" strokeWidth="3" />
            <path
                d="M50 30 C42 30 35 22 38 15 C44 15 50 22 50 30 Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <path
                d="M50 30 C58 30 65 22 62 15 C56 15 50 22 50 30 Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
            />
        </svg>
    );
}
