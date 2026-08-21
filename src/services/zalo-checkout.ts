import { CheckoutSDK, EventName, events } from "zmp-sdk/apis";
import { supabase } from "./supabase";

interface CheckoutMacResponse {
  mac: string;
}

interface FunctionErrorWithContext {
  message?: string;
  context?: Response;
}

interface ZaloCheckoutItem {
  id: string;
  name: string;
  amount: number;
  quantity?: number;
}

interface CreateZaloCheckoutOrderInput {
  amount: number;
  desc: string;
  item: ZaloCheckoutItem[];
  extradata?: Record<string, unknown>;
}

type PaymentEventData = Record<string, string | null | undefined> & {
  orderId?: string;
  zmpOrderId?: string;
  transId?: string;
  appTransID?: string;
  apptransid?: string;
};

interface CheckoutOrderResult {
  orderId: string;
  messageToken?: string;
  transId?: string;
  paymentStatus?: "paid";
}

interface CheckoutTransactionResult {
  orderId: string;
  transId: string;
  resultCode: number;
  msg?: string;
}

export class ZaloCheckoutCancelledError extends Error {
  constructor(message = "Bạn vừa hủy đặt cọc, hiện tại shop sẽ chưa tiến hành xác nhận đơn hàng.") {
    super(message);
    this.name = "ZaloCheckoutCancelledError";
  }
}

export const isZaloCheckoutCancelledError = (error: unknown) =>
  error instanceof ZaloCheckoutCancelledError ||
  (error instanceof Error && error.name === "ZaloCheckoutCancelledError");

const getRuntimeMiniAppId = () => {
  const runtimeWindow = window as Window & {
    APP_ID?: string | number;
    zAppID?: string | number;
  };

  return String(runtimeWindow.APP_ID ?? runtimeWindow.zAppID ?? "");
};

const CHECKOUT_RESULT_TIMEOUT_MS = 5 * 60 * 1000;
const CHECKOUT_PENDING_SETTLE_MS = 8 * 1000;
const CHECKOUT_PENDING_RETRY_MS = 1500;
const CHECKOUT_PENDING_COPY = "Zalo chưa xác nhận thanh toán thành công, shop sẽ chưa ghi nhận đơn lúc này.";

const getFunctionErrorMessage = async (error: unknown) => {
  const functionError = error as FunctionErrorWithContext;

  if (functionError.context instanceof Response) {
    try {
      const detail = await functionError.context.clone().json();
      if (typeof detail?.error === "string") return detail.error;
    } catch {
    }
  }

  return functionError.message || "Không tạo được xác thực thanh toán";
};

const getPaymentEventOrderId = (data?: PaymentEventData | null) =>
  data?.zmpOrderId || data?.orderId;

const waitForSuccessfulPayment = () => {
  let createdOrderId: string | undefined;
  let timeoutId: number | undefined;
  let pendingStartedAt: number | undefined;
  let pendingRetryId: number | undefined;

  let cleanup = () => { };

  const paymentResultPromise = new Promise<CheckoutTransactionResult>((resolve, reject) => {
    const checkPaymentResult = async (data?: PaymentEventData) => {
      const eventOrderId = getPaymentEventOrderId(data);

      if (createdOrderId && eventOrderId && eventOrderId !== createdOrderId) return;

      try {
        const transaction = await CheckoutSDK.checkTransaction({
          data: data ?? { zmpOrderId: createdOrderId },
        });

        if (createdOrderId && transaction.orderId && transaction.orderId !== createdOrderId) return;

        switch (transaction.resultCode) {
          case 1:
            cleanup();
            resolve(transaction);
            return;
          case -2:
            cleanup();
            reject(new ZaloCheckoutCancelledError());
            return;
          case 0:
            pendingStartedAt ??= Date.now();

            if (Date.now() - pendingStartedAt >= CHECKOUT_PENDING_SETTLE_MS) {
              cleanup();
              reject(new Error(transaction.msg || CHECKOUT_PENDING_COPY));
              return;
            }

            pendingRetryId = window.setTimeout(() => {
              void checkPaymentResult(data ?? { zmpOrderId: createdOrderId });
            }, CHECKOUT_PENDING_RETRY_MS);
            return;
          default:
            cleanup();
            reject(new Error(transaction.msg || "Bạn chưa hoàn tất thanh toán"));
            return;
        }
      } catch (err) {
        cleanup();
        reject(err instanceof Error ? err : new Error("Không kiểm tra được kết quả thanh toán"));
      }
    };

    const handlePaymentDone = (data?: PaymentEventData) => {
      void checkPaymentResult(data);
    };

    const handlePaymentClose = () => {
      cleanup();
      reject(new ZaloCheckoutCancelledError());
    };

    cleanup = () => {
      events.off(EventName.PaymentDone, handlePaymentDone);
      events.off(EventName.PaymentClose, handlePaymentClose);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      if (pendingRetryId) {
        window.clearTimeout(pendingRetryId);
      }
    };

    events.on(EventName.PaymentDone, handlePaymentDone);
    events.once(EventName.PaymentClose, handlePaymentClose);

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Quá thời gian chờ kết quả thanh toán"));
    }, CHECKOUT_RESULT_TIMEOUT_MS);
  });

  return {
    setCreatedOrder: (order: CheckoutOrderResult) => {
      createdOrderId = order.orderId;
    },
    cleanup,
    paymentResultPromise,
  };
};

export const createZaloCheckoutOrder = async ({
  amount,
  desc,
  item,
  extradata,
}: CreateZaloCheckoutOrderInput) => {
  if (!getRuntimeMiniAppId()) {
    throw new Error("Bạn cần mở app trong Zalo Mini App để thanh toán.");
  }

  const checkoutParams = {
    amount,
    desc,
    item,
    ...(extradata ? { extradata: JSON.stringify(extradata) } : {}),
  };

  const { data, error } = await supabase.functions.invoke<CheckoutMacResponse>(
    "zalo-checkout-mac",
    { body: checkoutParams },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (!data?.mac) {
    throw new Error("Không tạo được xác thực thanh toán");
  }

  const paymentResult = waitForSuccessfulPayment();

  try {
    const checkoutOrder = await CheckoutSDK.createOrder({
      ...checkoutParams,
      mac: data.mac,
    });

    paymentResult.setCreatedOrder(checkoutOrder);

    const transaction = await paymentResult.paymentResultPromise;

    return {
      ...checkoutOrder,
      transId: transaction.transId || checkoutOrder.transId,
      paymentStatus: "paid" as const,
    };
  } catch (err) {
    paymentResult.cleanup();
    throw err;
  }
};
