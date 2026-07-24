import { useGetActiveProducts } from "queries/products";
import { ProductCard } from "components/common";

export const ProductsPage = () => {
  const { data: products, isLoading, isError } = useGetActiveProducts({});

  return (
    <div className="min-h-screen bg-background-main pt-10">
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
