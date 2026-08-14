import { LazyImage } from "components/ui";
import { CustomerOrder } from "types";
import { formatPrice } from "utils";

interface OrderProductsBlockProps {
  order: CustomerOrder;
}

export const OrderProductsBlock = ({ order }: OrderProductsBlockProps) => {
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
              <p className="shrink-0 text-sm font-extrabold text-title-text">
                {formatPrice(item.total_price)}
              </p>
              {item.note && (
                <p className="mt-1 text-xs font-semibold text-text-muted">Ghi chú: {item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
