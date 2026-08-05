import { Promotions } from "types";
import { formatPrice } from "utils";

interface CartSummarySectionProps {
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  depositRate: number;
  maxDepositAmount: number;
  selectedPromotion?: Promotions;
  promotionUnavailableReason?: string | null;
  hasInvalidStock: boolean;
  orderError?: Error | null;
}

export const CartSummarySection = ({
  subtotal,
  discountAmount,
  finalPrice,
  depositAmount,
  remainingAmount,
  depositRate,
  maxDepositAmount,
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
          <span className="font-bold text-text-main">Tổng đơn</span>
          <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(finalPrice)}</span>
        </div>
        <div className="mt-2 rounded-2xl bg-background-main p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-text-main">Đặt cọc</span>
            <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(depositAmount)}</span>
          </div>
          <div className="mt-1 flex items-start justify-between gap-3 text-xs font-semibold text-text-muted">
            <span className="min-w-0 leading-5">
              Cọc  <span className="font-bold text-[#B91C1C]">{Math.round(depositRate * 100)}%</span> đơn hàng hoặc tối đa <span className="font-bold text-[#B91C1C]">{formatPrice(maxDepositAmount)}</span>. Còn lại là <span className="font-bold text-[#B91C1C]">{formatPrice(remainingAmount)}</span> bạn thanh toán COD hoặc sau khi nhận hàng giúp shop nhé.
            </span>
            {/* <span className="shrink-0 text-right leading-5">{formatPrice(remainingAmount)}</span> */}
          </div>
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
