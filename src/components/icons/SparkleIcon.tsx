import { useIconProps } from "./hooks";
import { IconProps } from "./types";

export const SparkleIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);
    return (
        <svg viewBox="0 0 100 100" fill="currentColor" {...iconProps}>
            <path d="M50 15 C53 34 40 46 21 50 C40 54 53 66 50 85 C47 66 60 54 79 50 C60 46 47 34 50 15 Z" />
            <path d="M78 12 C79 19 82 22 89 24 C82 26 79 29 78 36 C77 29 74 26 67 24 C74 22 77 19 78 12 Z" />
        </svg>
    );
}
