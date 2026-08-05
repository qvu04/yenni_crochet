import { useState } from "react";
import { Link } from "react-router-dom";
import { ConditionalRender } from "components/common";
import { EmptyCartIcon } from "components/icons";
import { Emptier, Spinner } from "components/ui";
import { useZaloCustomerProfile } from "hooks/useZaloCustomerProfile";
import { useGetCustomerOrderHistory } from "queries";
import { CustomerOrderFilter } from "types";
import { getFriendlyErrorMessage } from "utils";
import { OrderHistoryCard } from "./components";
import { ORDER_FILTERS } from "./order-ui";

export const OrderHistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState<CustomerOrderFilter>("all");
  const { profile, isLoading: isLoadingProfile } = useZaloCustomerProfile();
  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useGetCustomerOrderHistory({
    zaloUserId: profile?.zalo_user_id,
    status: activeFilter,
    options: {
      refetchOnMount: "always",
    },
  });
  const isLoadingOrders = isLoading || isLoadingProfile;
  const isEmptyOrders = !isLoadingOrders && !error && orders?.length === 0;

  return (
    <main className="bg-background-main pb-6">
      <div className="top-[calc(56px+var(--zaui-safe-area-inset-top,0px))] z-20 bg-background-main/95 px-5 py-3 backdrop-blur">
        <div className="scrollbar-none flex gap-1 overflow-x-auto rounded-2xl bg-white/80 p-1 shadow-sm ring-1 ring-text-main/5">
          {ORDER_FILTERS.map((filter) => {
            const isActive = filter.key === activeFilter;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-[13px] font-extrabold leading-none transition ${isActive
                  ? "bg-title-text text-white shadow-[0_6px_14px_rgba(92,64,51,0.18)]"
                  : "text-text-muted active:bg-background-main"
                  }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5">
        <ConditionalRender
          isLoading={isLoadingOrders}
          loadingRender={<Spinner label="Đang tải đơn hàng..." />}
          isError={Boolean(error)}
          errorRender={
            <Emptier
              icon={<EmptyCartIcon />}
              title="Không tải được đơn hàng"
              compact
              description={getFriendlyErrorMessage(error)}
              action={{ label: "Thử lại", onClick: refetch }}
            />
          }
          isEmpty={isEmptyOrders}
          emptyRender={
            <div className="pt-8">
              <Emptier
                icon={<EmptyCartIcon />}
                title="Chưa có đơn hàng"
                compact
                description="Khi bạn đặt hàng, lịch sử đơn sẽ xuất hiện ở đây."
              />
              <Link
                to="/"
                className="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-extrabold text-text-main"
              >
                Xem sản phẩm
              </Link>
            </div>
          }
          onRefresh={refetch}
        >
          <div className="space-y-3">
            {orders?.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))}
          </div>
        </ConditionalRender>
      </div>
    </main>
  );
};
