import { AiOutlineGift } from "react-icons/ai";
import { PromotionPickerSkeleton } from "components/ui";
import { UserPromotions } from "types";
import { formatDiscount, getPromotionUnavailableReason } from "utils";

interface CartPromotionSectionProps {
  zaloUserId?: string;
  promotions?: UserPromotions[];
  selectedPromotionId?: string;
  subtotal: number;
  isLoading: boolean;
  onSelectPromotion: (promotionId?: string) => void;
}

export const CartPromotionSection = ({
  zaloUserId,
  promotions,
  selectedPromotionId,
  subtotal,
  isLoading,
  onSelectPromotion,
}: CartPromotionSectionProps) => {
  const hasPromotions = Boolean(promotions?.length);

  return (
    <section className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-lg text-title-text">
          <AiOutlineGift />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold text-title-text">Ưu đãi của bạn</h2>
          <p className="text-xs font-semibold text-text-muted">
            {isLoading ? "Đang tải voucher" : "Chọn 1 voucher đã đổi"}
          </p>
        </div>
      </div>

      {zaloUserId && isLoading && <PromotionPickerSkeleton />}

      {!zaloUserId && (
        <p className="rounded-2xl bg-background-main p-3 text-xs font-semibold leading-5 text-text-muted">
          Chưa lấy được thông tin Zalo nên chưa thể tải voucher của bạn.
        </p>
      )}

      {zaloUserId && !isLoading && !hasPromotions && (
        <p className="rounded-2xl bg-background-main p-3 text-xs font-semibold leading-5 text-text-muted">
          Bạn chưa có voucher để đổi. Hãy nhớ kiểm tra voucher của mình để đổi và sử dụng bạn nhé.
        </p>
      )}

      {hasPromotions && (
        <div className="space-y-2">
          {promotions?.map((userPromotion) => {
            if (!userPromotion.promotion) return null;

            const isSelected = selectedPromotionId === userPromotion.promotion_id;
            const unavailableReason = getPromotionUnavailableReason(userPromotion.promotion, subtotal);
            const isUnavailable = Boolean(unavailableReason);

            return (
              <button
                key={userPromotion.id}
                type="button"
                disabled={isUnavailable}
                onClick={() => {
                  if (isUnavailable) return;
                  onSelectPromotion(isSelected ? undefined : userPromotion.promotion_id);
                }}
                className={`w-full rounded-2xl p-3 text-left transition disabled:cursor-not-allowed ${
                  isUnavailable
                    ? "bg-background-main/70 text-text-muted opacity-70 ring-1 ring-text-main/5"
                    : isSelected
                      ? "bg-primary text-text-main ring-2 ring-title-text/10"
                      : "bg-background-main text-text-main ring-1 ring-text-main/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-extrabold">{userPromotion.promotion.code}</p>
                    <p className="mt-1 line-clamp-1 text-xs font-semibold text-text-muted">
                      {userPromotion.promotion.title}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold shadow-sm ${
                      isUnavailable ? "text-text-muted" : "text-title-text"
                    }`}
                  >
                    {formatDiscount(userPromotion.promotion)}
                  </span>
                </div>
                {unavailableReason && (
                  <p className="mt-2 text-xs font-semibold text-[#B91C1C]">{unavailableReason}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
