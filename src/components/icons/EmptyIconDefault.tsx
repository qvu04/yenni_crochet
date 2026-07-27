import { useIconProps } from "./hooks"
import { IconProps } from "./types"

export const EmptyIconDefault: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);
    return (
        <svg
            viewBox="0 0 112 112"
            aria-hidden="true"
            className="h-24 w-24"
            fill="none"
            {...iconProps}
        >
            <circle cx="56" cy="56" r="42" fill="white" fillOpacity="0.72" />
            <path
                d="M36 48c0-8.8 7.2-16 16-16h8c8.8 0 16 7.2 16 16v17c0 8.8-7.2 16-16 16h-8c-8.8 0-16-7.2-16-16V48Z"
                fill="var(--color-primary)"
            />
            <path
                d="M45 53h22M45 63h15"
                stroke="var(--color-text-main)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeOpacity="0.42"
            />
            <path
                d="M79 27v8M75 31h8M31 75v6M28 78h6"
                stroke="var(--color-primary-dark)"
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    )
}