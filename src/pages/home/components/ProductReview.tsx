import { Products } from 'types';
import { formatPrice } from 'utils';

interface ProductReviewProps {
    product: Products;
    onSelect: (productId: string) => void
}
export const ProductPreview = ({ product, onSelect }: ProductReviewProps) => (
    <button
        type="button"
        onClick={() => onSelect(product.id)}
        className="flex min-w-[148px] max-w-[148px] flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_10px_24px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5 active:scale-[0.98]"
    >
        <div className="aspect-square w-full overflow-hidden bg-background-main">
            {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-text-muted">
                    Yenni Crochet
                </div>
            )}
        </div>
        <div className="min-h-[78px] p-3">
            <p className="line-clamp-2 min-h-9 text-sm font-bold leading-[18px] text-text-main">
                {product.name}
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-title-text">{formatPrice(product.price)}</p>
        </div>
    </button>
);
