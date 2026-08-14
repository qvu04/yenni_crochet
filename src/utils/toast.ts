import { Toast } from "antd-mobile";
import { createElement } from "react";

interface ErrorWithStatus {
  message?: string;
  status?: number;
  code?: string | number;
  context?: Response;
}

const getErrorStatus = (error: unknown) => {
  const errorWithStatus = error as ErrorWithStatus;
  return errorWithStatus?.status ?? errorWithStatus?.context?.status;
};

export const getFriendlyErrorMessage = (error: unknown, fallback = "Có lỗi xảy ra, bạn thử lại nhé.") => {
  const status = getErrorStatus(error);
  const message = error instanceof Error
    ? error.message
    : typeof (error as ErrorWithStatus)?.message === "string"
      ? (error as ErrorWithStatus).message
      : "";

  if (status === 400) return "Thông tin chưa hợp lệ, bạn kiểm tra lại giúp shop nhé.";
  if (status === 401) return "Phiên đăng nhập đã hết hạn, bạn mở lại Mini App rồi thử lại nhé.";
  if (status === 402) return "Thanh toán chưa hoàn tất, bạn có thể thử lại khi sẵn sàng.";
  if (status === 403) return "Bạn chưa có quyền thực hiện thao tác này.";
  if (status === 404) return "Không tìm thấy dữ liệu cần xử lý.";
  if (status === 409) return "Dữ liệu vừa thay đổi, bạn tải lại rồi thử lần nữa nhé.";
  if (status === 429) return "Bạn thao tác hơi nhanh, chờ một chút rồi thử lại nhé.";
  if (status && status >= 500) return "Hệ thống đang bận, bạn thử lại sau ít phút nhé.";

  return message || fallback;
};

type ToastVariant = "error" | "success";
interface ToastOptions {
  duration?: number;
}

const toastTheme: Record<ToastVariant, {
  mark: string;
  markClassName: string;
}> = {
  error: {
    mark: "!",
    markClassName: "bg-[#FEE2E2] text-[#B91C1C]",
  },
  success: {
    mark: "✓",
    markClassName: "bg-primary text-title-text",
  },
};

const renderToastContent = (message: string, variant: ToastVariant) => {
  const theme = toastTheme[variant];

  return createElement(
    "div",
    {
      className:
        "flex max-w-[min(86vw,360px)] items-start gap-3 rounded-2xl border border-text-main/10 bg-white px-4 py-3 text-left text-sm font-semibold leading-5 text-text-main shadow-[0_10px_30px_rgba(51,39,42,0.14)]",
    },
    createElement(
      "span",
      {
        className: `mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${theme.markClassName}`,
      },
      theme.mark,
    ),
    createElement("span", { className: "min-w-0 flex-1" }, message),
  );
};

const showToast = (message: string, variant: ToastVariant, options: ToastOptions = {}) => {
  Toast.show({
    content: renderToastContent(message, variant),
    duration: options.duration ?? (variant === "error" ? 4200 : 2800),
    maskClickable: true,
    position: "top",
  });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  showToast(message, "error", options);
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  showToast(message, "success", options);
};
