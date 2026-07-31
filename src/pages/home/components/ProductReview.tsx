import { Products } from 'types';
import { formatPrice, getStockLabel, hasBulkPricing } from 'utils';

interface ProductReviewProps {
    product: Products;
    onSelect: (productId: string) => void
}
export const ProductPreview = ({ product, onSelect }: ProductReviewProps) => {
    const hasPriceTiers = hasBulkPricing(product.product_price_tiers);

    return (
        <button
            type="button"
            onClick={() => onSelect(product.id)}
            className="flex min-w-[148px] max-w-[148px] flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_10px_24px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5 active:scale-[0.98]"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-background-main">
                {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-text-muted">
                        Yenni Crochet
                    </div>
                )}
                {hasPriceTiers && (
                    <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold leading-none text-title-text shadow-sm">
                        Giá sỉ
                    </span>
                )}
            </div>
            <div className="flex min-h-[92px] flex-col p-3">
                <p className="line-clamp-2 min-h-9 text-sm font-bold leading-[18px] text-text-main">
                    {product.name}
                </p>
                <div className="mt-1.5 flex min-h-5 items-center gap-1.5">
                    <p className="min-w-0 truncate text-sm font-extrabold text-title-text">{formatPrice(product.price)}</p>
                    {hasPriceTiers && (
                        <span className="shrink-0 rounded-full bg-primary/70 px-1.5 py-0.5 text-[9px] font-extrabold leading-none text-title-text">
                            Sỉ
                        </span>
                    )}
                </div>
                <p className={`mt-auto pt-1 text-[11px] font-semibold ${product.stock_quantity > 0 ? "text-text-muted" : "text-[#B91C1C]"}`}>
                    {getStockLabel(product.stock_quantity)}
                </p>
            </div>
        </button>
    );
};
