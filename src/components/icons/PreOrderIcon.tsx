import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const PreOrderIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <rect x="20" y="22" width="60" height="58" rx="8" stroke="currentColor" strokeWidth="4" />
            <path
                d="M34 15 V30 M66 15 V30 M21 39 H79"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M39 58 H51 M39 68 H61"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <path
                d="M66 51 C72 55 75 60 75 67 C75 74 70 79 63 79 C56 79 51 74 51 67 C51 60 56 55 66 51 Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
        </svg>
    );
};
