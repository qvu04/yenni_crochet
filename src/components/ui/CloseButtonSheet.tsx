import { Icon } from 'zmp-ui';
export const CloseButtonSheet = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-text-main shadow-sm backdrop-blur"
    >
        <Icon icon="zi-close" />
    </button>
);