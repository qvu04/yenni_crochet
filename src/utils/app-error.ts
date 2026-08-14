import { getFriendlyErrorMessage, showErrorToast } from "./toast";

export interface AppErrorContext {
  component?: string;
  action?: string;
  fallback?: string;
  userMessage?: string;
  extraData?: Record<string, unknown>;
  silent?: boolean;
}

export const normalizeAppError = (error: unknown, fallback = "Có lỗi xảy ra, bạn thử lại nhé.") => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  const message = typeof (error as { message?: unknown })?.message === "string"
    ? String((error as { message?: unknown }).message)
    : fallback;

  return new Error(message);
};

export const getAppErrorMessage = (error: unknown, fallback?: string) => {
  return getFriendlyErrorMessage(error, fallback ?? "Có lỗi xảy ra, bạn thử lại nhé.");
};

export const handleAppError = (error: unknown, context: AppErrorContext = {}) => {
  const normalizedError = normalizeAppError(error, context.fallback);
  const message = context.userMessage ?? getAppErrorMessage(normalizedError, context.fallback);

  console.error("[YenniAppError]", {
    component: context.component ?? "UnknownComponent",
    action: context.action ?? "UnknownAction",
    message: normalizedError.message,
    extraData: context.extraData,
    error,
  });

  if (!context.silent) {
    showErrorToast(message);
  }

  return message;
};
