// components/icons/NewIcon.tsx
import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const NewIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);

    return (
        <svg viewBox="0 0 100 100" fill="none" {...iconProps}>
            <path
                d="M50 14 C51.5 30 58 40 76 42 C58 44 51.5 54 50 70 C48.5 54 42 44 24 42 C42 40 48.5 30 50 14 Z"
                fill="currentColor"
            />
            <path
                d="M78 18 C78.6 24 81 26.4 87 27 C81 27.6 78.6 30 78 36 C77.4 30 75 27.6 69 27 C75 26.4 77.4 24 78 18 Z"
                fill="currentColor"
            />
            <path
                d="M22 62 C22.5 66.8 25.2 69.5 30 70 C25.2 70.5 22.5 73.2 22 78 C21.5 73.2 18.8 70.5 14 70 C18.8 69.5 21.5 66.8 22 62 Z"
                fill="currentColor"
            />
        </svg>
    );
};