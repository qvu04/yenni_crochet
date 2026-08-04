import { useState } from "react";
import { AiOutlineDown } from "react-icons/ai";
import { CustomerOrderItem } from "types";

interface OrderItemsPreviewProps {
  items: CustomerOrderItem[];
}

export const OrderItemsPreview = ({ items }: OrderItemsPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleItems = isExpanded ? items : items.slice(0, 2);
  const remainingCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div>
      <div className="space-y-2">
        {visibleItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-t border-text-main/5 pt-2 first:border-t-0 first:pt-0">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-background-main">
              {item.product_image ? (
                <img src={item.product_image} alt={item.product_name ?? "Sản phẩm"} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-text-muted">YC</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs font-extrabold leading-5 text-text-main">
                x{item.quantity} {item.product_name ?? "Sản phẩm Yenni Crochet"}
              </p>
              {(item.variant_color_name || item.variant_name) && (
                <p className="mt-0.5 truncate text-[11px] font-semibold text-text-muted">
                  {item.variant_color_name ?? item.variant_name}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length > 2 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded((value) => !value);
          }}
          className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-extrabold text-text-muted"
        >
          {isExpanded ? "Rút gọn" : `Xem thêm ${remainingCount} sản phẩm`}
          <AiOutlineDown className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
};
