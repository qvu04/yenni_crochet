import { Products } from 'types';
import { formatPrice, getStockLabel, hasBulkPricing } from 'utils';
import { useProductSheetStore } from 'stores/productSheet';
import { motion } from 'motion/react';
import { getProductBadges } from 'utils/product';
interface ProductCardProps {
    product: Products;
    showProductTypeBadge?: boolean;
}
export const ProductCard = ({ product, showProductTypeBadge = true }: ProductCardProps) => {
    const inStock = product.stock_quantity > 0;
    const openProduct = useProductSheetStore((s) => s.openProduct);
    const badges = showProductTypeBadge ? getProductBadges(product) : [];
    const hasPriceTiers = hasBulkPricing(product.product_price_tiers);

    return (
        <motion.button
            type="button"
            onClick={() => openProduct(product.id)}
            className="group block w-full overflow-hidden rounded-[22px] bg-white text-left shadow-[0_10px_24px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5 transition active:scale-[0.98]"
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
            <div className="relative aspect-square w-full overflow-hidden bg-background-main">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`h-full w-full object-cover transition duration-300 group-active:scale-105`}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-text-muted">
                        Yenni Crochet
                    </div>
                )}

                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-text-main/25 to-transparent" />
                {(badges.length > 0 || hasPriceTiers) && (
                    <div className="absolute left-2 top-2 flex max-w-[calc(100%-16px)] flex-wrap gap-1">
                        {badges.map((badge) => (
                            <div
                                key={badge.key}
                                className={`rounded-full px-2 py-1 text-[10px] font-bold leading-none shadow-sm ${badge.className}`}
                            >
                                {badge.label}
                            </div>
                        ))}
                        {hasPriceTiers && (
                            <div className="rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold leading-none text-title-text shadow-sm">
                                Giá sỉ
                            </div>
                        )}
                    </div>
                )}
                {/* <div
                    className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-bold leading-none shadow-sm ${inStock
                        ? "bg-white/90 text-text-main"
                        : "bg-[#EF4444] text-white"
                        }`}
                >
                    {getStockLabel(product.stock_quantity)}
                </div> */}
            </div>

            <div className="flex min-h-[104px] flex-col p-3">
                <p className="line-clamp-2 min-h-10 font-heading text-sm font-semibold leading-5 text-text-main">
                    {product.name}
                </p>
                <div className="mt-1.5 flex min-h-5 items-center gap-1.5">
                    <p className="min-w-0 truncate text-[15px] font-extrabold leading-none text-text-main">
                        {formatPrice(product.price)}
                    </p>
                </div>
                <p className={`mt-auto pt-2 text-xs font-semibold ${inStock ? "text-text-muted" : "text-[#B91C1C]"}`}>
                    {getStockLabel(product.stock_quantity)}
                </p>
            </div>
        </motion.button>
    );
};
