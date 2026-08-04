import { motion } from "motion/react";
import { CustomerOrder } from "types";
import { getOrderStep, ORDER_STEPS } from "../order-ui";

interface OrderProgressStepperProps {
  order?: CustomerOrder;
}

export const OrderProgressStepper = ({ order }: OrderProgressStepperProps) => {
  const currentStep = getOrderStep(order);
  const isCancelled = order?.status === "cancelled" || order?.status === "canceled";
  const isDone = order?.status === "done" || order?.status === "completed";
  const progressPercent = `${((currentStep - 1) / (ORDER_STEPS.length - 1)) * 100}%`;

  if (isCancelled) {
    return (
      <div className="rounded-2xl bg-[#FEE2E2] p-4 text-sm font-bold text-[#B91C1C]">
        Đơn hàng đã được hủy. Bạn liên hệ shop nếu cần hỗ trợ thêm nhé.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative px-1">
        <div className="absolute left-[calc(10%+2px)] right-[calc(10%+2px)] top-4 h-1 rounded-full bg-text-main/10" />
        <div className="absolute left-[calc(10%+2px)] right-[calc(10%+2px)] top-4 h-1 overflow-hidden rounded-full">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: progressPercent }}
          />
        </div>
      </div>
      <div className="relative flex items-start">
        {ORDER_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep || isDone;
          const isActive = stepNumber === currentStep && !isDone;

          return (
            <div key={step.title} className="relative flex flex-1 flex-col items-center">
              <div
                className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-base shadow-sm transition ${isCompleted
                  ? "border-primary bg-primary text-title-text"
                  : isActive
                    ? "border-title-text bg-white text-title-text ring-4 ring-primary/25"
                    : "border-text-main/10 bg-white text-text-muted"
                  }`}
              >
                {isActive ? (
                  <motion.span
                    className="flex h-3 w-3 rounded-full bg-title-text"
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  step.icon
                )}
              </div>
              <p className={`mt-2 max-w-[70px] text-center text-[11px] font-bold leading-4 ${stepNumber <= currentStep ? "text-text-main" : "text-text-muted"}`}>
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
