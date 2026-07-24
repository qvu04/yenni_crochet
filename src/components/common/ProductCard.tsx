import { Products } from 'types';
import { formatPrice } from 'utils';
import { useProductSheetStore } from 'stores/productSheet';
import { motion } from 'motion/react';

const productTypeLabel: Record<NonNullable<Products["product_type"]>, string> = {
    best_seller: "Bán chạy",
    new: "Mới",
};

interface ProductCardProps {
    product: Products;
    showProductTypeBadge?: boolean;
}

export const ProductCard = ({ product, showProductTypeBadge = false }: ProductCardProps) => {
    const inStock = product.stock_quantity > 0;
    const openProduct = useProductSheetStore((s) => s.openProduct);

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
                {showProductTypeBadge && product.product_type && (
                    <div className={`absolute left-2 top-2 rounded-full ${product.product_type === "best_seller" ? "bg-[#8B1A1A] text-[#FFFFE0]" : "bg-[#8B6969] text-[#FFC0CB]"} px-2 py-1 text-[10px] font-bold leading-none shadow-sm`}>
                        {productTypeLabel[product.product_type]}
                    </div>
                )}
                {product.is_pre_order && (
                    <div className="absolute left-2 top-2 rounded-full bg-[#4A6C8C] text-white px-2 py-1 text-[10px] font-bold leading-none shadow-sm">
                        Đặt trước
                    </div>
                )}
            </div>

            <div className="min-h-[84px] p-3">
                <p className="line-clamp-2 min-h-10 font-heading text-sm font-semibold leading-5 text-text-main">
                    {product.name}
                </p>
                <p className="mt-1.5 text-[15px] font-extrabold leading-none text-text-main">
                    {formatPrice(product.price)}
                </p>
            </div>
        </motion.button>
    );
};