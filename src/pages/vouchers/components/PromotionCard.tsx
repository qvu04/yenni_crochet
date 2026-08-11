import { useState } from 'react';
import { AiOutlineCheck, AiOutlineCopy, AiOutlineGift, AiOutlineTag } from 'react-icons/ai';
import { copyToClipboard, formatDate, formatDiscount, getPromotionConditions } from 'utils';
import { Promotions } from 'types';
import { LazyImage, ModalSuccess, Spinner } from 'components/ui';

interface PromotionCardProps {
    promotion: Promotions;
    actionLabel?: string;
    isActionLoading?: boolean;
    onAction?: () => void;
    footer?: string;
}
export const PromotionCard = ({
    promotion,
    actionLabel,
    isActionLoading,
    onAction,
    footer,
}: PromotionCardProps) => {
    const conditions = getPromotionConditions(promotion);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyCode = async () => {
        try {
            await copyToClipboard(promotion.code || "")
            setIsCopied(true);
        } catch {
            setIsCopied(false);
        }
    }

    return (
        <article className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_24px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5">
            {promotion.banner_url && (
                <LazyImage
                    src={promotion.banner_url}
                    alt={promotion.title}
                    wrapperClassName="h-44"
                    className="h-full w-full object-cover"
                />
            )}

            <div className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl text-title-text">
                        <AiOutlineGift />
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="font-heading text-base font-extrabold leading-5 text-title-text">
                            {promotion.title}
                        </p>
                        {promotion.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-muted">
                                {promotion.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-background-main p-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase text-text-muted">Mã ưu đãi</p>
                        <p className="mt-1 truncate font-heading text-lg font-extrabold text-text-main">{promotion.code}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-title-text shadow-sm">
                            {formatDiscount(promotion)}
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyCode}
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-sm transition active:scale-95 ${isCopied
                                ? "bg-[#22C55E] text-white"
                                : "bg-white text-text-main"
                                }`}
                            aria-label={isCopied ? "Đã copy mã ưu đãi" : "Copy mã ưu đãi"}
                        >
                            {isCopied ? <AiOutlineCheck /> : <AiOutlineCopy />}
                        </button>
                    </div>
                </div>
                {conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {conditions.map((condition) => (
                            <span
                                key={condition}
                                className="rounded-full bg-background-main px-3 py-1 text-xs font-bold text-text-muted"
                            >
                                {condition}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
                    <AiOutlineTag className="text-base" />
                    Hạn dùng: {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                </div>

                {footer && (
                    <p className="rounded-2xl bg-background-main px-3 py-2 text-xs font-semibold text-text-muted">
                        {footer}
                    </p>
                )}

                {actionLabel && onAction && (
                    <button
                        type="button"
                        onClick={onAction}
                        disabled={isActionLoading}
                        className="w-full rounded-2xl bg-primary py-3 text-sm font-extrabold text-text-main disabled:bg-text-muted disabled:text-white"
                    >
                        {isActionLoading ? <Spinner label='Đang xử lý...' variant='inline' /> : actionLabel}
                    </button>
                )}
            </div>
            <ModalSuccess
                visible={isCopied}
                heading='Copy mã ưu đãi thành công'
                title='Yenni chúc bạn mua sắm vui vẻ'
                onClose={() => setIsCopied(false)}
            />
        </article>
    );
};
