import { useNavigate } from "react-router-dom";
import { CustomerOrder } from "types";
import { formatDate, formatPrice } from "utils";
import { getOrderStatusTone } from "../order-ui";
import { OrderItemsPreview } from "./OrderItemsPreview";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderHistoryCardProps {
  order: CustomerOrder;
}

const getShortOrderId = (id: string) => id.slice(0, 8).toUpperCase();

export const OrderHistoryCard = ({ order }: OrderHistoryCardProps) => {
  const navigate = useNavigate();
  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);
  const statusTone = getOrderStatusTone(order);
  const hasDeposit = order.deposit_amount > 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/account/orders/${order.id}`)}
      className="relative block w-full overflow-hidden rounded-3xl bg-white text-left shadow-[0_10px_26px_rgba(51,39,42,0.07)] ring-1 ring-text-main/5 transition active:scale-[0.99]"
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${statusTone.rail}`} />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-text-muted">
              Đơn #{getShortOrderId(order.id)}
            </p>
            <p className="mt-1 font-heading text-xl font-extrabold text-title-text">
              {formatPrice(order.final_price)}
            </p>
          </div>
          <OrderStatusBadge order={order} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
          <span>{totalQuantity} sản phẩm</span>
          <span className="h-1 w-1 rounded-full bg-text-muted/40" />
          <span>{formatDate(order.created_at)}</span>
          {hasDeposit && (
            <>
              <span className="h-1 w-1 rounded-full bg-text-muted/40" />
              <span>Đã cọc {formatPrice(order.deposit_amount)}</span>
            </>
          )}
        </div>

        <div className={`mt-4 grid grid-cols-2 gap-2 rounded-2xl ${statusTone.surface} p-2.5`}>
          <div>
            <p className={`text-[11px] font-bold ${statusTone.text}`}>Đặt cọc</p>
            <p className="mt-0.5 text-sm font-extrabold text-text-main">
              {formatPrice(order.deposit_amount)}
            </p>
          </div>
          <div className="border-l border-white/70 pl-2.5">
            <p className={`text-[11px] font-bold ${statusTone.text}`}>Còn lại</p>
            <p className="mt-0.5 text-sm font-extrabold text-text-main">
              {formatPrice(order.remaining_amount)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <OrderItemsPreview items={order.items} />
        </div>
      </div>
    </button>
  );
};
