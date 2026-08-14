import {
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineShoppingCart,
  AiOutlineTool,
} from "react-icons/ai";
import { CustomerAccountSummary } from "types";
import { formatPrice } from "utils";

interface AccountStatsGridProps {
  summary?: CustomerAccountSummary;
  isLoading?: boolean;
}

const loadingStats = [
  "Tổng đơn hàng",
  "Đơn đã thanh toán",
  "Tiền đã gửi",
  "Yêu cầu đặt riêng",
];

export const AccountStatsGrid = ({ summary, isLoading }: AccountStatsGridProps) => {
  if (isLoading) {
    return (
      <section className="grid grid-cols-2 gap-3">
        {loadingStats.map((label) => (
          <div key={label} className="h-28 animate-pulse rounded-2xl bg-white/70 p-4 ring-1 ring-text-main/5">
            <div className="h-8 w-8 rounded-full bg-background-main" />
            <div className="mt-4 h-3 w-20 rounded-full bg-background-main" />
            <div className="mt-2 h-5 w-12 rounded-full bg-background-main" />
          </div>
        ))}
      </section>
    );
  }

  const stats = [
    {
      label: "Tổng đơn hàng",
      value: summary?.total_orders ?? 0,
      icon: <AiOutlineShoppingCart />,
      helper: `${summary?.pending_orders ?? 0} đơn đang theo dõi`,
      className: "bg-white",
      iconClassName: "bg-primary/60 text-title-text",
    },
    {
      label: "Đơn đã thanh toán",
      value: summary?.paid_orders ?? 0,
      icon: <AiOutlineCheckCircle />,
      helper: "Cọc hoặc thanh toán full",
      className: "bg-[#F0FDF4]",
      iconClassName: "bg-white text-[#166534]",
    },
    {
      label: "Tiền đã gửi",
      value: formatPrice(summary?.total_deposit_amount ?? 0),
      icon: <AiOutlineClockCircle />,
      helper: "Ghi nhận từ Checkout",
      className: "bg-[#FFFBEB]",
      iconClassName: "bg-white text-[#92400E]",
    },
    {
      label: "Yêu cầu đặt riêng",
      value: summary?.total_custom_requests ?? 0,
      icon: <AiOutlineTool />,
      helper: `${summary?.pending_custom_requests ?? 0} yêu cầu đang xử lý`,
      className: "bg-[#FAF5FF]",
      iconClassName: "bg-white text-[#6B21A8]",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-3xl p-4 shadow-sm ring-1 ring-text-main/5 ${stat.className}`}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xl shadow-sm ${stat.iconClassName}`}>
            {stat.icon}
          </span>
          <p className="mt-4 text-xs font-bold text-text-muted">{stat.label}</p>
          <p className="mt-1 break-words font-heading text-xl font-extrabold text-title-text">
            {stat.value}
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-text-muted">{stat.helper}</p>
        </div>
      ))}
    </section>
  );
};
