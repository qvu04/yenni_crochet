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
  const checkoutLabel = paymentType === "full" ? "Cần chuyển khoản" : "Cọc + phí ship";
  const checkoutAmount = paymentType === "full" ? payableAmount : depositAmount + shippingFee;
  const nextRemainingAmount = paymentType === "full" ? 0 : remainingAmount;

  return (
    <section className="mb-5 overflow-hidden rounded-[28px] bg-[#33272A] text-sm text-white shadow-[0_16px_34px_rgba(51,39,42,0.18)]">
      <div className="bg-[linear-gradient(135deg,#33272A_0%,#33272A_62%,#C96F4A_100%)] px-4 py-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/60">Thanh toán</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="font-heading text-xl font-extrabold text-white">Lựa chọn phương thức</h2>
          {/* <span className="shrink-0 rounded-full bg-white/12 px-3 py-1 text-xs font-extrabold text-white">
            {Math.round(depositRate * 100)}%
          </span> */}
        </div>
      </div>

      <div className="space-y-2 p-4">
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-white/10 p-1.5">
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
                  ? "bg-[#C96F4A] text-white shadow-sm"
                  : "text-white/60"
                  }`}
              >
                <p className="text-sm font-extrabold">{option.label}</p>
                <p className="mt-0.5 text-[10px] font-bold leading-4">{option.helper}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 text-white/65">
          <span>Tạm tính</span>
          <span className="font-bold text-white">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-white/65">
          <span>Giảm giá</span>
          <span className="font-bold text-[#F5D6C8]">-{formatPrice(discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-white/65">
          <span>Phí ship mặc định</span>
          <span className="font-bold text-white">{formatPrice(shippingFee)}</span>
        </div>
        <div className="border-y border-dashed border-white/20 py-3">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-white">Tổng thanh toán</span>
            <span className="font-heading text-lg font-extrabold text-[#F5D6C8]">{formatPrice(payableAmount)}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-3xl bg-[#C96F4A] p-3 text-white">
              <p className="text-xs font-bold text-white/80">{checkoutLabel}</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-title-text">{formatPrice(checkoutAmount)}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-3 ring-1 ring-white/10">
              <p className="text-xs font-bold text-white/60">Còn lại</p>
              <p className="mt-1 font-heading text-lg font-extrabold text-white">{formatPrice(nextRemainingAmount)}</p>
            </div>
          </div>
        </div>

        <p className="rounded-2xl bg-white/10 p-3 text-xs font-semibold leading-5 text-white/65">
          {paymentType === "full"
            ? "Thanh toán toàn bộ đã bao gồm phí ship mặc định, đơn sẽ chờ shop xác nhận sau khi Zalo báo giao dịch thành công."
            : `Thanh toán hôm nay gồm tiền cọc sản phẩm và phí ship ${formatPrice(shippingFee)}. Mức cọc là 30%, tối thiểu ${formatPrice(minDepositAmount)} - tối đa ${formatPrice(maxDepositAmount)}.`}
        </p>

        {promotionUnavailableReason && selectedPromotion && (
          <p className="pt-1 text-xs font-semibold text-[#F5D6C8]">
            {promotionUnavailableReason}
          </p>
        )}
        {hasInvalidStock && (
          <p className="pt-1 text-xs font-semibold text-[#F5D6C8]">
            Có sản phẩm không đủ tồn kho, bạn kiểm tra lại số lượng nhé.
          </p>
        )}
        {orderError && (
          <p className="rounded-2xl bg-[#F5D6C8] p-3 text-sm text-[#33272A]">
            Đặt hàng thất bại, thử lại nhé: {orderError.message}
          </p>
        )}
      </div>
    </section>
  );
};
