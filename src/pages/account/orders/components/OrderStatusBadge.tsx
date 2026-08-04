import { CustomerOrder } from "types";
import { getOrderStatusClassName, getOrderStatusLabel } from "../order-ui";

interface OrderStatusBadgeProps {
  order: CustomerOrder;
}

export const OrderStatusBadge = ({ order }: OrderStatusBadgeProps) => {
  return (
    <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-extrabold ring-1 ${getOrderStatusClassName(order)}`}>
      {getOrderStatusLabel(order)}
    </span>
  );
};
