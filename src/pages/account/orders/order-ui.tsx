import { AiOutlineCheck, AiOutlineClockCircle, AiOutlineShoppingCart, AiOutlineTool } from "react-icons/ai";
import { CustomerOrder, CustomerOrderFilter, CustomerOrderStatus } from "types";

export const ORDER_FILTERS: Array<{ key: CustomerOrderFilter; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "waiting_payment", label: "Chờ cọc" },
  { key: "paid_deposit", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "making", label: "Đang làm" },
  { key: "shipping", label: "Đang giao" },
  { key: "done", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export const ORDER_STATUS_LABELS: Record<CustomerOrderStatus, string> = {
  pending: "Chờ xác nhận",
  awaiting_confirmation: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
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
  if (order.status === "pending" && order.payment_status === "pending" && order.payment_type === "full") return "Đang xác nhận thanh toán";
  if (order.status === "pending" && order.payment_status === "pending" && order.deposit_amount > 0) return "Đang xác nhận cọc + ship";
  if (order.status === "pending" && order.payment_status === "pending") return "Chờ đặt cọc";
  if (order.status === "awaiting_confirmation" || (order.status === "pending" && order.payment_status === "paid")) return "Chờ xác nhận";
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

export const getOrderStatusTone = (order: CustomerOrder) => {
  if (order.status === "cancelled" || order.status === "canceled" || order.payment_status === "failed") {
    return {
      rail: "bg-[#EF4444]",
      surface: "bg-[#FEF2F2]",
      text: "text-[#B91C1C]",
      ring: "ring-[#FECACA]",
      softBorder: "border-[#FECACA]",
    };
  }

  if (order.status === "done" || order.status === "completed") {
    return {
      rail: "bg-[#22C55E]",
      surface: "bg-[#F0FDF4]",
      text: "text-[#166534]",
      ring: "ring-[#BBF7D0]",
      softBorder: "border-[#BBF7D0]",
    };
  }

  if (order.status === "shipping" || order.status === "delivering") {
    return {
      rail: "bg-[#38BDF8]",
      surface: "bg-[#EFF6FF]",
      text: "text-[#075985]",
      ring: "ring-[#BAE6FD]",
      softBorder: "border-[#BAE6FD]",
    };
  }

  if (order.status === "making") {
    return {
      rail: "bg-[#C084FC]",
      surface: "bg-[#FAF5FF]",
      text: "text-[#6B21A8]",
      ring: "ring-[#E9D5FF]",
      softBorder: "border-[#E9D5FF]",
    };
  }

  if (order.status === "confirmed") {
    return {
      rail: "bg-[#FB7185]",
      surface: "bg-[#FFF1F2]",
      text: "text-[#9F1239]",
      ring: "ring-[#FDA4AF]",
      softBorder: "border-[#FDA4AF]",
    };
  }

  if (order.status === "pending" && order.payment_status === "pending") {
    return {
      rail: "bg-[#F59E0B]",
      surface: "bg-[#FFFBEB]",
      text: "text-[#92400E]",
      ring: "ring-[#FDE68A]",
      softBorder: "border-[#FDE68A]",
    };
  }

  return {
    rail: "bg-primary",
    surface: "bg-primary/20",
    text: "text-title-text",
    ring: "ring-primary",
    softBorder: "border-primary",
  };
};

export const getOrderStep = (order?: CustomerOrder) => {
  if (!order) return 1;
  if (order.status === "done" || order.status === "completed") return 4;
  if (order.status === "shipping" || order.status === "delivering") return 3;
  if (order.status === "making") return 2;
  return 1;
};

export const getOrderActiveStep = (order?: CustomerOrder) => {
  if (!order) return 1;
  if (order.status === "cancelled" || order.status === "canceled") return undefined;
  if (order.status === "done" || order.status === "completed") return undefined;
  if (order.status === "confirmed") return undefined;
  if (order.status === "shipping" || order.status === "delivering") return 3;
  if (order.status === "making") return 2;
  return 1;
};

export const getOrderCompletedStep = (order?: CustomerOrder) => {
  if (!order) return 0;
  if (order.status === "done" || order.status === "completed") return 4;
  if (order.status === "shipping" || order.status === "delivering") return 2;
  if (order.status === "making" || order.status === "confirmed") return 1;
  return 0;
};

export const ORDER_STEPS = [
  { title: "Chờ xác nhận", icon: <AiOutlineCheck /> },
  { title: "Đang làm", icon: <AiOutlineTool /> },
  { title: "Đang giao", icon: <AiOutlineShoppingCart /> },
  { title: "Hoàn thành", icon: <AiOutlineCheck /> },
];

export const getOrderProgressSteps = (order?: CustomerOrder) => {
  if (order?.status === "pending" && order.payment_status === "pending") {
    return [
      { title: order.payment_type === "full" ? "Xác nhận thanh toán" : order.deposit_amount > 0 ? "Xác nhận cọc + ship" : "Chờ cọc", icon: <AiOutlineClockCircle /> },
      ...ORDER_STEPS.slice(1),
    ];
  }

  if (
    order?.status === "confirmed" ||
    order?.status === "making" ||
    order?.status === "shipping" ||
    order?.status === "delivering" ||
    order?.status === "done" ||
    order?.status === "completed"
  ) {
    return [
      { title: "Đã xác nhận", icon: <AiOutlineCheck /> },
      ...ORDER_STEPS.slice(1),
    ];
  }

  return ORDER_STEPS;
};
