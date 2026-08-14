import { AiOutlineCheck, AiOutlineClockCircle } from "react-icons/ai";
import { CustomerOrder } from "types";
import { formatDate } from "utils";
import { getOrderActiveStep, getOrderCompletedStep, getOrderProgressSteps } from "../order-ui";

interface OrderTimelineProps {
  order: CustomerOrder;
}

export const OrderTimeline = ({ order }: OrderTimelineProps) => {
  const activeStep = getOrderActiveStep(order);
  const completedStep = getOrderCompletedStep(order);
  const orderSteps = getOrderProgressSteps(order);
  const isDone = order.status === "done" || order.status === "completed";
  const isCancelled = order.status === "cancelled" || order.status === "canceled";

  if (isCancelled) {
    return (
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
        <h2 className="font-heading text-lg font-extrabold text-title-text">Theo dõi đơn hàng</h2>
        <div className="mt-3 rounded-2xl bg-[#FEE2E2] p-3 text-sm font-bold leading-6 text-[#B91C1C]">
          Đơn hàng đã được hủy. Shop sẽ hỗ trợ nếu bạn cần kiểm tra lại thông tin đơn.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <h2 className="font-heading text-lg font-extrabold text-title-text">Theo dõi đơn hàng</h2>
      <div className="mt-4 space-y-0">
        {orderSteps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = isDone || stepNumber <= completedStep;
          const isCurrent = !isDone && stepNumber === activeStep;
          const isLast = index === orderSteps.length - 1;

          return (
            <div key={step.title} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span
                  className={`absolute left-4 top-8 h-[calc(100%-24px)] w-0.5 rounded-full ${isCompleted ? "bg-primary" : "bg-text-main/10"}`}
                />
              )}
              <span
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-base ${isCompleted
                  ? "border-primary bg-primary text-title-text"
                  : isCurrent
                    ? "border-title-text bg-white text-title-text"
                    : "border-text-main/10 bg-white text-text-muted"
                  }`}
              >
                {isCompleted ? <AiOutlineCheck /> : <AiOutlineClockCircle />}
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className={`text-sm font-extrabold ${isCompleted || isCurrent ? "text-text-main" : "text-text-muted"}`}>
                  {step.title}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">
                  {stepNumber === 1
                    ? isCompleted
                      ? "Shop đã xác nhận đơn hàng"
                      : `Đơn được tạo ngày ${formatDate(order.created_at)}`
                    : isCurrent
                      ? "Trạng thái hiện tại của đơn"
                      : isCompleted
                        ? "Đã hoàn tất bước này"
                        : "Shop sẽ cập nhật khi đơn chuyển bước"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
