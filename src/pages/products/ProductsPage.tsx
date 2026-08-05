import { useSearchParams } from "react-router-dom";
import { ConditionalRender, ProductCard } from "components/common";
import { ProductType, ProductBadge, Products } from 'types';
import { useGetProductsList } from "queries";
import { useEffect, useMemo, useState } from "react";
import { Emptier, ProductGridSkeleton } from "components/ui";
import { EmptyProductIcon } from "components/icons";
import { motion } from "motion/react";
import { ProductTypeShowcase } from "./components";

const productTypeLabels: Record<ProductType, string> = {
  best_seller: "Sản phẩm bán chạy",
  new: "Sản phẩm mới",
  pre_order: "Sản phẩm đặt trước",
};

const productTypeDescriptions: Record<ProductType, string> = {
  best_seller: "Những mẫu được yêu thích nhất tại Yenni Crochet.",
  new: "Các mẫu len mới vừa được shop cập nhật.",
  pre_order: "Những món cần thời gian chuẩn bị riêng cho bạn.",
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

export const productTypeBadges: Record<NonNullable<Products["product_type"]>, ProductBadge> = {
  best_seller: {
    key: "best_seller",
    label: "Bán chạy",
    className: "bg-[#8B1A1A] text-[#FFFFE0]",
  },
  new: {
    key: "new",
    label: "Mới",
    className: "bg-[#1F7A5C] text-white",
  },
  pre_order: {
    key: "pre_order",
    label: "Đặt trước",
    className: "bg-[#4A6C8C] text-white",
  },
};
export const preOrderBadge = productTypeBadges.pre_order;
export const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const productType = isProductType(typeParam) ? typeParam : undefined;
  const isPreOrder = productType === "pre_order";
  const isAllProductsPage = !productType;
  const hasCustomTypeLayout = productType === "best_seller" || productType === "new";
  const [selectedFilter, setSelectedFilter] = useState<ProductFilter>("all");
  const { data: products, isLoading, isError } = useGetProductsList({
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
  const pageDescription = productType
    ? productTypeDescriptions[productType]
    : "Tìm món len nhỏ xinh hợp với quà tặng, trang trí hoặc dùng hằng ngày.";
  const productCounts = useMemo(() => {
    const list = products ?? [];

    return {
      all: list.length,
      best_seller: list.filter((product) => product.product_type === "best_seller").length,
      new: list.filter((product) => product.product_type === "new").length,
      pre_order: list.filter((product) => product.product_type === "pre_order" || product.is_pre_order).length,
    } satisfies Record<ProductFilter, number>;
  }, [products]);

  useEffect(() => {
    setSelectedFilter("all");
  }, [typeParam]);

  return (
    <main className="flex min-h-screen flex-col bg-background-main px-5 pt-4">
      {!hasCustomTypeLayout && (
        <section className="mb-4 shrink-0 overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
            Bộ sưu tập
          </p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-heading text-[26px] font-extrabold leading-8 text-title-text">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm leading-5 text-text-muted">
                {pageDescription}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-3xl bg-background-main text-center">
              <span className="font-heading text-xl font-extrabold leading-none text-title-text">
                {visibleProducts.length}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase text-text-muted">
                mẫu
              </span>
            </div>
          </div>
        </section>
      )}

      {isAllProductsPage && (
        <div className="scrollbar-none mb-4 flex shrink-0 gap-2 overflow-x-auto px-1 py-1">
          {productFilterOptions.map((option) => {
            const isSelected = selectedFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedFilter(option.value)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition ${isSelected
                  ? "bg-title-text text-white shadow-[0_8px_18px_rgba(92,64,51,0.18)]"
                  : "bg-white/85 text-text-muted ring-1 ring-text-main/5"
                  }`}
              >
                <span>{option.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] leading-none ${isSelected ? "bg-white/20 text-white" : "bg-background-main text-text-muted"
                  }`}>
                  {productCounts[option.value]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="min-h-0 flex-1">
        <ConditionalRender
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && visibleProducts.length === 0}
          emptyRender={
            <Emptier
              icon={<EmptyProductIcon />}
              compact
              className="rounded-[28px] bg-white/70"
              title="Chưa có sản phẩm"
              description="Yenni Crochet sẽ cập nhật thêm sản phẩm phù hợp trong thời gian tới."
            />
          }
          loadingRender={
            <ProductGridSkeleton />
          }
        >
          {hasCustomTypeLayout && productType ? (
            <ProductTypeShowcase products={visibleProducts} productType={productType} />
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-6">
              {visibleProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.16), ease: "easeOut" }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </ConditionalRender>
      </div>
    </main>
  );
};
