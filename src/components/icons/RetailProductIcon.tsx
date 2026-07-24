import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const RetailProductIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <path
                d="M19 26 C19 20.5 23.5 16 29 16 H50 L82 48 C85.5 51.5 85.5 57.5 82 61 L61 82 C57.5 85.5 51.5 85.5 48 82 L16 50 V29 C16 27.3 17.3 26 19 26 Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <circle cx="35" cy="35" r="7" stroke="currentColor" strokeWidth="4" />
            <path
                d="M49 50 H69 M43 62 H63"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
};
