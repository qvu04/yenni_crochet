import { useSearchParams } from "react-router-dom";
import { ConditionalRender, ProductCard } from "components/common";
import { ProductType } from "types";
import { useGetProductsList } from "queries";
import { useEffect, useMemo, useState } from "react";

const productTypeLabels: Record<ProductType, string> = {
  best_seller: "Sản phẩm bán chạy",
  new: "Sản phẩm mới",
  pre_order: "Sản phẩm đặt trước",
};

type ProductFilter = "all" | ProductType;

const productFilterOptions: { label: string; value: ProductFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Bán chạy", value: "best_seller" },
  { label: "Mới", value: "new" },
  { label: "Đặt trước", value: "pre_order" },
];

const isProductType = (value: string | null): value is ProductType => {
  return value === "best_seller" || value === "new" || value === "pre_order";
};

export const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const productType = isProductType(typeParam) ? typeParam : undefined;
  const isPreOrder = productType === "pre_order";
  const isAllProductsPage = !productType;
  const [selectedFilter, setSelectedFilter] = useState<ProductFilter>("all");
  const { data: products, isLoading, isError, refetch } = useGetProductsList({
    productType: isPreOrder ? undefined : productType,
    preOrder: isPreOrder,
  });
  const visibleProducts = useMemo(() => {
    if (!products) return [];
    if (!isAllProductsPage || selectedFilter === "all") return products;
    if (selectedFilter === "pre_order") {
      return products.filter((product) => product.product_type === "pre_order" || product.is_pre_order);
    }
    return products.filter((product) => product.product_type === selectedFilter);
  }, [isAllProductsPage, products, selectedFilter]);
  const pageTitle = productType ? productTypeLabels[productType] : "Tất cả sản phẩm";

  useEffect(() => {
    setSelectedFilter("all");
  }, [typeParam]);

  return (
    <div className="min-h-screen bg-background-main pt-10">
      <div className="px-5 pt-4">
        <div className="mb-4">
          <h1 className="font-heading text-2xl font-bold text-title-text">
            {pageTitle} ({visibleProducts.length})
          </h1>
        </div>

        {isAllProductsPage && (
          <div className="scrollbar-none mb-4 flex gap-2 overflow-x-auto py-1 px-1">
            {productFilterOptions.map((option) => {
              const isSelected = selectedFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedFilter(option.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${isSelected
                    ? "bg-primary text-text-main shadow-sm"
                    : "bg-white/80 text-text-muted ring-1 ring-text-main/5"
                    }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        <ConditionalRender
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && visibleProducts.length === 0}
          onRefresh={refetch}
          loadingRender={
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-3 pb-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </ConditionalRender>
      </div>
    </div>
  );
};
