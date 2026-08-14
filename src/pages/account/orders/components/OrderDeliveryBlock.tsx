import { AiOutlineEnvironment, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
import { CustomerOrder } from "types";

interface OrderDeliveryBlockProps {
  order: CustomerOrder;
}

export const OrderDeliveryBlock = ({ order }: OrderDeliveryBlockProps) => (
  <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
    <h2 className="font-heading text-lg font-extrabold text-title-text">Thông tin nhận hàng</h2>
    <div className="mt-3 space-y-2 text-sm font-semibold text-text-main">
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlineUser className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1">{order.customer_name}</span>
      </div>
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlinePhone className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1">{order.phone}</span>
      </div>
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlineEnvironment className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1 leading-6">{order.address}</span>
      </div>
      {order.note && (
        <p className="rounded-2xl border border-primary/60 bg-primary/15 p-3 text-xs font-bold leading-5 text-text-muted">
          Ghi chú: {order.note}
        </p>
      )}
    </div>
  </section>
);
