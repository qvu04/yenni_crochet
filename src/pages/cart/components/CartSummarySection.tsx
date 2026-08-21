import { OrderPaymentType, Promotions } from "types";
import { formatPrice } from "utils";

interface CartSummarySectionProps {
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
  shippingFee: number;
  payableAmount: number;
  depositAmount: number;
  remainingAmount: number;
  depositRate: number;
  minDepositAmount: number;
  maxDepositAmount: number;
  selectedPromotion?: Promotions;
  promotionUnavailableReason?: string | null;
  hasInvalidStock: boolean;
  orderError?: Error | null;
  paymentType: Extract<OrderPaymentType, "deposit" | "full">;
  onPaymentTypeChange: (paymentType: Extract<OrderPaymentType, "deposit" | "full">) => void;
}

export const CartSummarySection = ({
  subtotal,
  discountAmount,
  finalPrice,
  shippingFee,
  payableAmount,
  depositAmount,
  remainingAmount,
  depositRate,
  minDepositAmount,
  maxDepositAmount,
  selectedPromotion,
  promotionUnavailableReason,
  hasInvalidStock,
  orderError,
  paymentType,
  onPaymentTypeChange,
}: CartSummarySectionProps) => {
  const checkoutLabel = paymentType === "full" ? "Thanh toán hôm nay" : "Cọc + phí ship";
  const checkoutAmount = paymentType === "full" ? payableAmount : depositAmount + shippingFee;
  const nextRemainingAmount = paymentType === "full" ? 0 : remainingAmount;

  return (
    <section className="mb-5 overflow-hidden rounded-[28px] bg-white text-sm shadow-[0_12px_28px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5">
      <div className="bg-title-text px-4 py-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/60">Thanh toán</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-extrabold text-white">Lựa chọn phương thức</h2>
          {/* <span className="shrink-0 rounded-full bg-white/12 px-3 py-1 text-xs font-extrabold text-white">
            {Math.round(depositRate * 100)}%
          </span> */}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-background-main/70 p-1.5">
          {[
            { value: "deposit" as const, label: "Đặt cọc", helper: "Trả trước một phần" },
            { value: "full" as const, label: "Thanh toán toàn bộ", helper: "Trả toàn bộ đơn" },
          ].map((option) => {
            const isSelected = paymentType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onPaymentTypeChange(option.value)}
                className={`min-h-[58px] rounded-2xl px-3 py-2 text-left transition ${isSelected
                  ? "bg-white text-title-text shadow-sm ring-1 ring-primary"
                  : "text-text-muted"
                  }`}
              >
                <p className="text-sm font-extrabold">{option.label}</p>
                <p className="mt-0.5 text-[10px] font-bold leading-4">{option.helper}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 text-text-muted">
          <span>Tạm tính</span>
          <span className="font-bold text-text-main">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-text-muted">
          <span>Giảm giá</span>
          <span className="font-bold text-[#B91C1C]">-{formatPrice(discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-text-muted">
          <span>Phí ship mặc định</span>
          <span className="font-bold text-text-main">{formatPrice(shippingFee)}</span>
        </div>
        <div className="border-y border-dashed border-text-main/15 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-text-main">Tổng thanh toán</span>
            <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(payableAmount)}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-3xl bg-[#FFF1F2] p-3 ring-1 ring-[#FDA4AF]/60">
              <p className="text-xs font-bold text-[#9F1239]">{checkoutLabel}</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-title-text">{formatPrice(checkoutAmount)}</p>
            </div>
            <div className="rounded-3xl bg-background-main p-3">
              <p className="text-xs font-bold text-text-muted">Còn lại</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-title-text">{formatPrice(nextRemainingAmount)}</p>
            </div>
          </div>
        </div>

        <p className="rounded-2xl bg-background-main/70 p-3 text-xs font-semibold leading-5 text-text-muted">
          {paymentType === "full"
            ? "Thanh toán toàn bộ đã bao gồm phí ship mặc định, đơn không còn khoản cần thu sau khi shop xác nhận."
            : `Thanh toán hôm nay gồm tiền cọc sản phẩm và phí ship ${formatPrice(shippingFee)}. Mức cọc là 30%, tối thiểu ${formatPrice(minDepositAmount)} - tối đa ${formatPrice(maxDepositAmount)}.`}
        </p>

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
      </div>
    </section>
  );
};
