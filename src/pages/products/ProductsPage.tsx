import { useNavigate } from "react-router-dom";
import { useGetActiveProducts } from "queries/products";
import { ProductCard } from "components/common";

export const ProductsPage = () => {
  const { data: products, isLoading, isError } = useGetActiveProducts({});
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-main">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-white px-5 py-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl text-text-main">
          ←
        </button>
        <p className="text-lg font-bold text-text-main">Tất cả sản phẩm</p>
      </div>

      <div className="px-5 pt-4">
        {isLoading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}

        {isError && (
          <p className="rounded-2xl bg-white p-4 text-sm text-text-muted">
            Không tải được sản phẩm, thử lại sau nhé.
          </p>
        )}

        {!isLoading && !isError && products?.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-sm text-text-muted">
            Chưa có sản phẩm nào.
          </p>
        )}

        {!isLoading && !isError && products && products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
