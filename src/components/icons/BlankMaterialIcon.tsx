import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const BlankMaterialIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <circle cx="43" cy="48" r="28" stroke="currentColor" strokeWidth="4" />
            <path
                d="M18 49 C35 37 51 36 68 48 M23 31 C39 50 51 61 66 67 M22 67 C37 53 51 41 67 29"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
            />
            <path
                d="M65 68 C73 65 82 66 87 72 C82 80 72 82 63 76"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <path
                d="M61 76 C59 84 54 88 47 88"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
};
