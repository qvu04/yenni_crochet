import { AiOutlineEnvironment, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
import { CustomerOrder } from "types";
import { formatPrice } from "utils";

interface OrderDetailBlocksProps {
  order: CustomerOrder;
}

export const OrderDeliveryBlock = ({ order }: OrderDetailBlocksProps) => (
  <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
    <h2 className="font-heading text-lg font-extrabold text-title-text">Thông tin nhận hàng</h2>
    <div className="mt-3 space-y-3 text-sm font-semibold text-text-muted">
      <div className="flex gap-3">
        <AiOutlineUser className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span>{order.customer_name}</span>
      </div>
      <div className="flex gap-3">
        <AiOutlinePhone className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span>{order.phone}</span>
      </div>
      <div className="flex gap-3">
        <AiOutlineEnvironment className="mt-0.5 shrink-0 text-lg text-title-text" />
        <span className="leading-6">{order.address}</span>
      </div>
      {order.note && (
        <p className="rounded-2xl bg-background-main p-3 text-xs font-bold leading-5 text-text-muted">
          Ghi chú: {order.note}
        </p>
      )}
    </div>
  </section>
);

export const OrderProductsBlock = ({ order }: OrderDetailBlocksProps) => {
  const totalQuantity = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-extrabold text-title-text">Sản phẩm</h2>
        <span className="text-xs font-extrabold text-text-muted">{totalQuantity} món</span>
      </div>
      <div className="mt-3 divide-y divide-text-main/5">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background-main">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name ?? "Sản phẩm"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-text-muted">YC</div>
              )}
            </div>
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
  <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
    <h2 className="font-heading text-lg font-extrabold text-title-text">Thanh toán</h2>
    <div className="mt-3 space-y-2 text-sm">
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Tạm tính</span>
        <span className="font-bold text-text-main">{formatPrice(order.subtotal_price)}</span>
      </div>
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Giảm giá</span>
        <span className="font-bold text-[#B91C1C]">-{formatPrice(order.discount_amount)}</span>
      </div>
      <div className="border-t border-text-main/10 pt-2">
        <div className="flex justify-between gap-3">
          <span className="font-bold text-text-main">Tổng đơn</span>
          <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(order.final_price)}</span>
        </div>
      </div>
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Đã cọc</span>
        <span className="font-bold text-text-main">{formatPrice(order.deposit_amount)}</span>
      </div>
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Còn lại</span>
        <span className="font-bold text-text-main">{formatPrice(order.remaining_amount)}</span>
      </div>
    </div>
  </section>
);
