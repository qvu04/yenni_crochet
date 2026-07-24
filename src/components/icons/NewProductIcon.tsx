import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const NewProductIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <path
                d="M18 28 C18 22.5 22.5 18 28 18 H52 L82 48 C85.5 51.5 85.5 57.5 82 61 L61 82 C57.5 85.5 51.5 85.5 48 82 L18 52 Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <circle cx="35" cy="35" r="6" stroke="currentColor" strokeWidth="4" />
            <path
                d="M67 18 C68 26 72 30 80 31 C72 32 68 36 67 44 C66 36 62 32 54 31 C62 30 66 26 67 18 Z"
                fill="currentColor"
            />
            <path
                d="M49 55 H67 M49 65 H60"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
};
