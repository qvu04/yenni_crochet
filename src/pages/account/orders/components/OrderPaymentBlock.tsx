import { CustomerOrder } from "types";
import { formatDate, formatPrice } from "utils";
import { Spinner } from "components/ui";

interface OrderPaymentBlockProps {
  order: CustomerOrder;
  onPay?: () => void;
  isPaying?: boolean;
}

export const OrderPaymentBlock = ({ order, onPay, isPaying = false }: OrderPaymentBlockProps) => {
  const paidLabel = order.payment_type === "full" ? "Đã thanh toán" : "Đã thanh toán hôm nay";
  const pendingLabel = order.payment_type === "full" ? "Thanh toán đang xác nhận" : "Cọc + ship đang xác nhận";
  const isWaitingForPayment = order.status === "pending" && order.payment_status !== "paid";
  const paymentLabel = order.payment_status === "paid" ? paidLabel : isWaitingForPayment ? "Chưa thanh toán" : pendingLabel;
  const payableAmount = order.final_price + order.shipping_fee;

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-text-main/5">
      <div className="bg-title-text px-4 py-3">
        <h2 className="font-heading text-lg font-extrabold text-white">Thanh toán</h2>
      </div>
      <div className="space-y-2 p-4 text-sm">
        <div className="flex justify-between gap-3 text-text-muted">
          <span>Tạm tính</span>
          <span className="font-bold text-text-main">{formatPrice(order.subtotal_price)}</span>
        </div>
        <div className="flex justify-between gap-3 text-text-muted">
          <span>Giảm giá</span>
          <span className="font-bold text-[#B91C1C]">-{formatPrice(order.discount_amount)}</span>
        </div>
        <div className="border-y border-dashed border-text-main/15 py-3">
          <div className="mb-2 flex justify-between gap-3 text-text-muted">
            <span>Phí ship</span>
            <span className="font-bold text-text-main">{formatPrice(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="font-bold text-text-main">Tổng thanh toán</span>
            <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(payableAmount)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-2xl bg-primary/20 p-3">
            <p className="text-xs font-bold text-text-muted">{paymentLabel}</p>
            <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.deposit_amount)}</p>
          </div>
          <div className="rounded-2xl bg-background-main p-3">
            <p className="text-xs font-bold text-text-muted">Còn lại</p>
            <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.remaining_amount)}</p>
          </div>
        </div>
        {isWaitingForPayment && onPay && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onPay}
              disabled={isPaying || order.deposit_amount <= 0}
              className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-title-text px-4 text-sm font-extrabold text-white disabled:bg-text-muted"
            >
              {isPaying ? <Spinner label="Đang mở thanh toán..." variant="inline" /> : `Thanh toán ${formatPrice(order.deposit_amount)}`}
            </button>
            <p className="mt-2 text-center text-xs font-semibold leading-5 text-text-muted">
              Đơn vẫn được giữ lại. Bạn có thể thanh toán lại khi sẵn sàng.
            </p>
            {order.payment_expires_at && (
              <p className="mt-1 text-center text-xs font-bold text-[#92400E]">
                Giữ tồn kho đến {formatDate(order.payment_expires_at)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
