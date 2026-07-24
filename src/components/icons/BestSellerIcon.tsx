import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const BestSellerIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <path
                d="M50 13 L59 31 L79 34 L64.5 48 L68 68 L50 58.5 L32 68 L35.5 48 L21 34 L41 31 Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <path
                d="M31 70 V86 L50 76 L69 86 V70"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M43 45 L48 50 L59 39"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
