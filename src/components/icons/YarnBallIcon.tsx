import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const YarnBallIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);
    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="3" />
            <path
                d="M15 50 Q50 30 85 50 M20 30 Q50 55 80 72 M20 72 Q50 55 80 30"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <path
                d="M78 78 L92 92 M92 78 L86 92"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}