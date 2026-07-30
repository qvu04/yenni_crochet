import { Promotions } from "types";
import { formatPrice } from "utils";

interface CartSummarySectionProps {
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
  selectedPromotion?: Promotions;
  promotionUnavailableReason?: string | null;
  hasInvalidStock: boolean;
  orderError?: Error | null;
}

export const CartSummarySection = ({
  subtotal,
  discountAmount,
  finalPrice,
  selectedPromotion,
  promotionUnavailableReason,
  hasInvalidStock,
  orderError,
}: CartSummarySectionProps) => {
  return (
    <section className="mb-5 space-y-2 rounded-3xl bg-white p-4 text-sm shadow-sm ring-1 ring-text-main/5">
      <div className="flex items-center justify-between gap-3 text-text-muted">
        <span>Tạm tính</span>
        <span className="font-bold text-text-main">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-text-muted">
        <span>Giảm giá</span>
        <span className="font-bold text-[#B91C1C]">-{formatPrice(discountAmount)}</span>
      </div>
      <div className="border-t border-text-main/10 pt-2">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-text-main">Tổng thanh toán</span>
          <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(finalPrice)}</span>
        </div>
      </div>

      {promotionUnavailableReason && selectedPromotion && (
        <p className="pt-1 text-xs font-semibold text-[#B91C1C]">
          {promotionUnavailableReason}
        </p>
      )}
      {hasInvalidStock && (
        <p className="pt-1 text-xs font-semibold text-[#B91C1C]">
          Có sản phẩm không đủ tồn kho, bạn kiểm tra lại số lượng nhé.
        </p>
      )}
      {orderError && (
        <p className="rounded-2xl bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          Đặt hàng thất bại, thử lại nhé: {orderError.message}
        </p>
      )}
    </section>
  );
};
