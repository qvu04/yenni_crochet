import { AiOutlineHeart } from "react-icons/ai";
import { LazyImage } from "components/ui";
import { useProductSheetStore } from "stores/productSheet";
import { WishlistItem } from "types";
import { formatDate, formatPrice } from "utils";

interface AccountWishlistSectionProps {
  items?: WishlistItem[];
  isLoading?: boolean;
}

export const AccountWishlistSection = ({ items, isLoading }: AccountWishlistSectionProps) => {
  const openProduct = useProductSheetStore((state) => state.openProduct);

  if (isLoading) {
    return (
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
        <div className="h-5 w-28 animate-pulse rounded-full bg-background-main" />
        <div className="mt-3 flex gap-3 overflow-hidden">
          {[1, 2, 3].map((item) => (
            <div key={item} className="w-36 shrink-0 animate-pulse rounded-2xl bg-background-main p-2">
              <div className="aspect-square rounded-xl bg-white" />
              <div className="mt-3 h-3 w-24 rounded-full bg-white" />
              <div className="mt-2 h-3 w-16 rounded-full bg-white" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-extrabold text-title-text">Sản phẩm yêu thích</h2>
          <p className="mt-1 text-xs font-semibold text-text-muted">
            {items?.length ? `${items.length} sản phẩm đã lưu` : "Lưu món yêu thích để xem lại nhanh"}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/60 text-xl text-title-text">
          <AiOutlineHeart />
        </span>
      </div>

      {!items?.length ? (
        <div className="mt-3 rounded-2xl bg-background-main p-4 text-sm font-semibold leading-6 text-text-muted">
          Bạn chưa lưu sản phẩm nào. Mở chi tiết sản phẩm rồi bấm tim để thêm vào sản phẩm yêu thích của riêng mình nhé.
        </div>
      ) : (
        <div className="-mx-1 mt-3 flex gap-3 overflow-x-auto px-1 pb-1 scrollbar-none">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openProduct(item.product_id)}
              className="w-36 shrink-0 rounded-2xl bg-background-main p-2 text-left transition active:scale-[0.98]"
            >
              <LazyImage
                src={item.product.images?.[0]}
                alt={item.product.name}
                wrapperClassName="aspect-square rounded-xl bg-white"
                className="h-full w-full object-cover"
              />
              <p className="mt-2 line-clamp-2 min-h-9 text-xs font-extrabold leading-[18px] text-text-main">
                {item.product.name}
              </p>
              <p className="mt-1 truncate text-sm font-extrabold text-title-text">
                {formatPrice(item.product.price)}
              </p>
              <p className="mt-1 truncate text-[10px] font-semibold text-text-muted">
                Đã lưu {formatDate(item.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
