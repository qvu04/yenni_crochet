import { AiOutlineCheck, AiOutlineClockCircle, AiOutlineShoppingCart, AiOutlineTool } from "react-icons/ai";
import { CustomerOrder, CustomerOrderFilter, CustomerOrderStatus } from "types";

export const ORDER_FILTERS: Array<{ key: CustomerOrderFilter; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "waiting_payment", label: "Chờ cọc" },
  { key: "paid_deposit", label: "Đã cọc" },
  { key: "confirmed", label: "Đã nhận" },
  { key: "making", label: "Đang làm" },
  { key: "shipping", label: "Đang giao" },
  { key: "done", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export const ORDER_STATUS_LABELS: Record<CustomerOrderStatus, string> = {
  pending: "Shop đã nhận đơn",
  confirmed: "Đã nhận",
  making: "Đang làm",
  shipping: "Đang giao",
  delivering: "Đang giao",
  done: "Hoàn thành",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  canceled: "Đã hủy",
};

export const getOrderStatusLabel = (order: CustomerOrder) => {
  if (order.status === "cancelled" || order.status === "canceled") return ORDER_STATUS_LABELS.cancelled;
  if (order.status === "done" || order.status === "completed") return ORDER_STATUS_LABELS.done;
  if (order.status === "pending" && order.payment_status === "pending") return "Chờ đặt cọc";
  return ORDER_STATUS_LABELS[order.status] ?? "Đang xử lý";
};

export const getOrderStatusClassName = (order: CustomerOrder) => {
  if (order.status === "cancelled" || order.status === "canceled" || order.payment_status === "failed") {
    return "bg-[#FEE2E2] text-[#B91C1C] ring-[#FECACA]";
  }
  if (order.status === "done" || order.status === "completed") {
    return "bg-[#DCFCE7] text-[#166534] ring-[#BBF7D0]";
  }
  if (order.status === "pending" && order.payment_status === "pending") {
    return "bg-[#FEF3C7] text-[#92400E] ring-[#FDE68A]";
  }
  return "bg-primary/70 text-title-text ring-primary";
};

export const getOrderStep = (order?: CustomerOrder) => {
  if (!order) return 1;
  if (order.status === "done" || order.status === "completed") return 5;
  if (order.status === "shipping" || order.status === "delivering") return 4;
  if (order.status === "making") return 3;
  if (order.status === "confirmed" || order.payment_status === "paid") return 2;
  return 1;
};

export const ORDER_STEPS = [
  { title: "Chờ cọc", icon: <AiOutlineClockCircle /> },
  { title: "Đã nhận", icon: <AiOutlineCheck /> },
  { title: "Đang làm", icon: <AiOutlineTool /> },
  { title: "Đang giao", icon: <AiOutlineShoppingCart /> },
  { title: "Hoàn thành", icon: <AiOutlineCheck /> },
];
