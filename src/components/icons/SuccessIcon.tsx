import { IconProps } from './types';
import { useIconProps } from './hooks';
export const SuccessIcon: React.FC<IconProps> = (props) => {
    const iconProps = useIconProps(props);
    return (
        <svg
            viewBox="0 0 96 96"
            aria-hidden="true"
            className="mx-auto h-20 w-20"
            fill="none"
            {...iconProps}
        >
            <circle cx="48" cy="48" r="38" fill="var(--color-primary)" />
            <circle
                cx="48"
                cy="48"
                r="31"
                stroke="var(--color-text-main)"
                strokeOpacity="0.12"
                strokeWidth="2"
            />
            <path
                d="M31 49.5 43.2 61 66.5 36"
                stroke="var(--color-text-main)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M74 20v8M70 24h8M23 28v6M20 31h6"
                stroke="var(--color-primary-dark)"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle cx="70" cy="70" r="3" fill="var(--color-primary-dark)" />
        </svg>
    )
}