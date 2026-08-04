import { AiOutlineEdit, AiOutlineShopping } from "react-icons/ai";
import { CustomerAccountSummary } from "types";
import { formatDate } from "utils";

interface AccountActivityPanelProps {
  summary?: CustomerAccountSummary;
}

const getDateLabel = (value?: string) => {
  return value ? formatDate(value) : "Chưa có dữ liệu";
};

export const AccountActivityPanel = ({ summary }: AccountActivityPanelProps) => {
  const activities = [
    {
      label: "Đơn hàng gần nhất",
      value: getDateLabel(summary?.latest_order_at),
      icon: <AiOutlineShopping />,
    },
    {
      label: "Yêu cầu đặt riêng gần nhất",
      value: getDateLabel(summary?.latest_custom_request_at),
      icon: <AiOutlineEdit />,
    },
  ];

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <h2 className="font-heading text-lg font-extrabold text-title-text">Hoạt động gần đây</h2>
      <div className="mt-3 space-y-3">
        {activities.map((activity) => (
          <div key={activity.label} className="flex items-center gap-3 rounded-2xl bg-background-main p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg text-title-text shadow-sm">
              {activity.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-text-muted">{activity.label}</p>
              <p className="mt-0.5 truncate text-sm font-extrabold text-text-main">{activity.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
