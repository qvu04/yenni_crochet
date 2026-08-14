import { CustomerOrder } from "types";
import { formatPrice } from "utils";

interface OrderPaymentBlockProps {
  order: CustomerOrder;
}

export const OrderPaymentBlock = ({ order }: OrderPaymentBlockProps) => {
  const depositLabel = order.payment_status === "paid" ? "Đã cọc" : "Cọc đang xác nhận";

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
          <div className="flex justify-between gap-3">
            <span className="font-bold text-text-main">Tổng đơn</span>
            <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(order.final_price)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded-2xl bg-primary/20 p-3">
            <p className="text-xs font-bold text-text-muted">{depositLabel}</p>
            <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.deposit_amount)}</p>
          </div>
          <div className="rounded-2xl bg-background-main p-3">
            <p className="text-xs font-bold text-text-muted">Còn lại</p>
            <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.remaining_amount)}</p>
          </div>
        </div>
        {/* {order.payment_status === "pending" && order.deposit_amount > 0 && (
          <p className="rounded-2xl bg-[#FFFBEB] p-3 text-xs font-bold leading-5 text-[#92400E]">
            Zalo đang xác nhận giao dịch cọc. Khi hoàn tất, đơn sẽ chuyển sang trạng thái chờ shop xác nhận.
          </p>
        )} */}
      </div>
    </section>
  );
};
