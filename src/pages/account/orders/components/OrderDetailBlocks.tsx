import { AiOutlineEnvironment, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
import { LazyImage } from "components/ui";
import { CustomerOrder } from "types";
import { formatPrice } from "utils";

interface OrderDetailBlocksProps {
  order: CustomerOrder;
}

export const OrderDeliveryBlock = ({ order }: OrderDetailBlocksProps) => (
  <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
    <h2 className="font-heading text-lg font-extrabold text-title-text">Thông tin nhận hàng</h2>
    <div className="mt-3 space-y-2 text-sm font-semibold text-text-main">
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlineUser className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1">{order.customer_name}</span>
      </div>
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlinePhone className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1">{order.phone}</span>
      </div>
      <div className="flex gap-3 rounded-2xl bg-background-main/70 p-3">
        <AiOutlineEnvironment className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="min-w-0 flex-1 leading-6">{order.address}</span>
      </div>
      {order.note && (
        <p className="rounded-2xl border border-primary/60 bg-primary/15 p-3 text-xs font-bold leading-5 text-text-muted">
          Ghi chú: {order.note}
        </p>
      )}
    </div>
  </section>
);

export const OrderProductsBlock = ({ order }: OrderDetailBlocksProps) => {
  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-extrabold text-title-text">Sản phẩm</h2>
        <span className="rounded-full bg-background-main px-3 py-1 text-xs font-extrabold text-text-muted">
          {totalQuantity} món
        </span>
      </div>
      <div className="mt-3 divide-y divide-text-main/5">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <LazyImage
              src={item.product_image ?? undefined}
              alt={item.product_name ?? "Sản phẩm"}
              fallbackLabel="YC"
              wrapperClassName="h-14 w-14 shrink-0 rounded-xl"
              className="h-full w-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-extrabold leading-5 text-text-main">
                x{item.quantity} {item.product_name ?? "Sản phẩm Yenni Crochet"}
              </p>
              {(item.variant_color_name || item.variant_name) && (
                <p className="mt-1 text-xs font-semibold text-text-muted">
                  {item.variant_color_name ?? item.variant_name}
                </p>
              )}
              {item.note && (
                <p className="mt-1 text-xs font-semibold text-text-muted">Ghi chú: {item.note}</p>
              )}
            </div>
            <p className="shrink-0 text-sm font-extrabold text-title-text">
              {formatPrice(item.total_price)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export const OrderPaymentBlock = ({ order }: OrderDetailBlocksProps) => (
  <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-text-main/5">
    <div className="bg-title-text px-4 py-3">
      <h2 className="font-heading text-lg font-extrabold text-white">Thanh toán</h2>
    </div>
    <div className="space-y-2 p-4 text-sm">
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Tạm tính</span>
        <span className="font-bold text-text-main">{formatPrice(order.subtotal_price)}</span>
      </div>
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Giảm giá</span>
        <span className="font-bold text-[#B91C1C]">-{formatPrice(order.discount_amount)}</span>
      </div>
      <div className="border-y border-dashed border-text-main/15 py-3">
        <div className="flex justify-between gap-3">
          <span className="font-bold text-text-main">Tổng đơn</span>
          <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(order.final_price)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="rounded-2xl bg-primary/20 p-3">
          <p className="text-xs font-bold text-text-muted">Đã cọc</p>
          <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.deposit_amount)}</p>
        </div>
        <div className="rounded-2xl bg-background-main p-3">
          <p className="text-xs font-bold text-text-muted">Còn lại</p>
          <p className="mt-1 font-extrabold text-text-main">{formatPrice(order.remaining_amount)}</p>
        </div>
      </div>
    </div>
  </section>
);
