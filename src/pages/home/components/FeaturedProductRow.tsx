// components/FeaturedProductRow.tsx
import { ConditionalRender, ProductCard } from "components/common";
import { motion } from "motion/react";
import { useGetFeaturedProductsByType } from "queries";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType } from "types";
interface FeaturedProductRowProps {
    title: string;
    productType?: ProductType;
    preOrder?: boolean;
    showTypeBadge?: boolean;
    icon?: ReactNode;
}
export const FeaturedProductRow = ({ title, productType, preOrder, showTypeBadge = true, icon }: FeaturedProductRowProps) => {
    const { data: products, isLoading, isError } = useGetFeaturedProductsByType({ productType, preOrder });
    const navigate = useNavigate();
    const seeAllPath = preOrder
        ? "/products?type=pre_order"
        : productType
            ? `/products?type=${productType}`
            : "/products";

    return (
        <div>
            <div className="relative mb-3 min-h-11 flex items-center justify-between">
                <p className="shrink-0 font-heading text-[13px] font-semibold text-title-text flex items-center justify-center gap-1">
                    {icon}<span className="text-xl">{title}</span>
                </p>
                <button
                    onClick={() => navigate(seeAllPath)}
                    className="absolute right-0 top-4 text-sm font-semibold text-title-text"
                >
                    Xem tất cả →
                </button>
            </div>

            <ConditionalRender
                isLoading={isLoading}
                isError={isError}
                isEmpty={products?.length === 0}
                loadingRender={
                    <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-44 w-[118px] shrink-0 animate-pulse rounded-2xl bg-white/65 sm:w-[145px]"
                            />
                        ))}
                    </div>
                }
                errorRender={
                    <p className="rounded-2xl bg-white/70 p-4 text-sm text-text-muted">
                        Không tải được sản phẩm, thử lại sau nhé.
                    </p>
                }
                emptyRender={
                    <p className="rounded-2xl bg-white/70 p-4 text-sm text-text-muted">
                        Chưa có sản phẩm phù hợp.
                    </p>
                }
            >
                <div className="scrollbar-none flex snap-x gap-3 overflow-x-auto pb-1">
                    {products?.map((product) => (
                        <motion.div
                            key={product.id}
                            className="w-[31%] min-w-[132px] max-w-[156px] shrink-0 snap-start"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.35 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                            <ProductCard product={product} showProductTypeBadge={showTypeBadge} />
                        </motion.div>
                    ))}
                </div>
            </ConditionalRender>
        </div>
    );
};
