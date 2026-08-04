import { useNavigate } from "react-router-dom";
import { CustomerOrder } from "types";
import { formatDate, formatPrice } from "utils";
import { OrderItemsPreview } from "./OrderItemsPreview";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderHistoryCardProps {
  order: CustomerOrder;
}

const getShortOrderId = (id: string) => id.slice(0, 8).toUpperCase();

export const OrderHistoryCard = ({ order }: OrderHistoryCardProps) => {
  const navigate = useNavigate();
  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button
      type="button"
      onClick={() => navigate(`/account/orders/${order.id}`)}
      className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-text-main/5 transition active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-text-muted">Đơn #{getShortOrderId(order.id)}</p>
          <p className="mt-1 font-heading text-lg font-extrabold text-title-text">
            {formatPrice(order.final_price)}
          </p>
        </div>
        <OrderStatusBadge order={order} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-text-muted">
        <span>{totalQuantity} sản phẩm</span>
        <span className="h-1 w-1 rounded-full bg-text-muted/40" />
        <span>{formatDate(order.created_at)}</span>
        {order.deposit_amount > 0 && (
          <>
            <span className="h-1 w-1 rounded-full bg-text-muted/40" />
            <span>Đã cọc {formatPrice(order.deposit_amount)}</span>
          </>
        )}
      </div>

      <div className="mt-3">
        <OrderItemsPreview items={order.items} />
      </div>
    </button>
  );
};
