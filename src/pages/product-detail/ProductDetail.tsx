import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetProductById } from "queries/products";
import { formatPrice } from "utils";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useGetProductById({ id: id! });
  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="h-72 w-full animate-pulse rounded-2xl bg-background-main" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-5">
        <p className="rounded-2xl bg-background-main p-4 text-sm text-text-muted">
          Không tìm thấy sản phẩm này.
        </p>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;

  return (
    <div className="pb-24">
      <img
        src={product.images?.[0]}
        alt={product.name}
        className={`h-72 w-full object-cover ${!inStock ? "grayscale" : ""}`}
      />

      <div className="space-y-4 px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xl font-bold text-text-main">{product.name}</p>
            <p className="mt-1 text-lg font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white ${
              inStock ? "bg-[#22C55E]" : "bg-[#EF4444]"
            }`}
          >
            {inStock ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>

        {product.estimated_days && (
          <span className="inline-block rounded-full bg-background-main px-3 py-1 text-xs font-semibold text-primary">
            Đặt trước {product.estimated_days}
          </span>
        )}

        <p className="text-sm leading-relaxed text-text-muted">{product.description}</p>

        {product.allow_customization && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-main">
              Ghi chú tùy chỉnh (màu, tên thêu, yêu cầu riêng...)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ví dụ: màu hồng pastel, thêu tên Lan"
              className="w-full rounded-2xl border border-background-main bg-white p-3 text-sm text-text-main outline-none focus:border-primary"
            />
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-background-main bg-white p-4">
        <button
          disabled={!inStock}
          className="w-full rounded-2xl bg-primary py-3 text-center text-base font-bold text-white disabled:bg-text-muted"
        >
          {inStock ? "Đặt hàng" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
};