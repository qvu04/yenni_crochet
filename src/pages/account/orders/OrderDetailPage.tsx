import { Link, useParams } from "react-router-dom";
import { AiOutlineCopy, AiOutlineMessage, AiOutlineUnorderedList } from "react-icons/ai";
import { ConditionalRender } from "components/common";
import { EmptyCartIcon } from "components/icons";
import { Emptier, Spinner } from "components/ui";
import { useZaloCustomerProfile } from "hooks/useZaloCustomerProfile";
import { useGetCustomerOrderDetail } from "queries";
import { copyToClipboard, formatDate, getFriendlyErrorMessage, showErrorToast, showSuccessToast } from "utils";
import {
  OrderDeliveryBlock,
  OrderPaymentBlock,
  OrderProductsBlock,
  OrderProgressStepper,
  OrderStatusBadge,
  OrderTimeline,
} from "./components";
import { getOrderStatusLabel } from "./order-ui";

const getShortOrderId = (id: string) => id.slice(0, 8).toUpperCase();

export const OrderDetailPage = () => {
  const { orderId } = useParams();
  const { profile, isLoading: isLoadingProfile } = useZaloCustomerProfile();
  const {
    data: order,
    isLoading,
    error,
    refetch,
  } = useGetCustomerOrderDetail({
    zaloUserId: profile?.zalo_user_id,
    orderId,
    options: {
      refetchOnMount: "always",
    },
  });
  const isLoadingOrder = isLoading || isLoadingProfile;

  const handleCopyOrderId = async () => {
    if (!order?.id) return;

    try {
      await copyToClipboard(order.id);
      showSuccessToast("Đã sao chép mã đơn.");
    } catch {
      showErrorToast("Chưa sao chép được mã đơn, bạn thử lại nhé.");
    }
  };

  return (
    <main className="min-h-screen bg-background-main px-5 pb-6 pt-5">
      <ConditionalRender
        isLoading={isLoadingOrder}
        loadingRender={<Spinner label="Đang tải chi tiết đơn..." />}
        isError={Boolean(error) || !order}
        errorRender={
          <Emptier
            icon={<EmptyCartIcon />}
            title="Không tải được chi tiết đơn"
            description={getFriendlyErrorMessage(error)}
            action={{ label: "Thử lại", onClick: refetch }}
          />
        }
        onRefresh={refetch}
      >
        {order ? (
          <div className="space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-text-muted">Trạng thái đơn hàng</p>
                  <h1 className="mt-1 font-heading text-2xl font-extrabold text-title-text">
                    {getOrderStatusLabel(order)}
                  </h1>
                </div>
                <OrderStatusBadge order={order} />
              </div>

              <div className="mt-4 rounded-2xl bg-background-main p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-muted">Mã đơn hàng</p>
                    <p className="mt-1 truncate text-sm font-extrabold text-text-main">
                      #{getShortOrderId(order.id)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-xl text-title-text shadow-sm"
                    aria-label="Sao chép mã đơn"
                  >
                    <AiOutlineCopy />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-text-muted">
                  <span>{order.status === "done" ? "Ngày hoàn thành" : "Ngày đặt hàng"}</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              <div className="mt-5">
                <OrderProgressStepper order={order} />
              </div>
            </section>

            <OrderTimeline order={order} />
            <OrderDeliveryBlock order={order} />
            <OrderProductsBlock order={order} />
            <OrderPaymentBlock order={order} />

            <section className="grid grid-cols-2 gap-3">
              <Link
                to="/contact"
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-3 text-sm font-extrabold text-text-main"
              >
                <AiOutlineMessage className="text-lg" />
                Liên hệ shop
              </Link>
              <Link
                to="/account/orders"
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-extrabold text-title-text shadow-sm ring-1 ring-text-main/5"
              >
                <AiOutlineUnorderedList className="text-lg" />
                Lịch sử đơn
              </Link>
            </section>
          </div>
        ) : null}
      </ConditionalRender>
    </main>
  );
};
