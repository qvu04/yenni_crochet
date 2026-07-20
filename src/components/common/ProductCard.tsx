import { useNavigate } from 'react-router-dom';
import { Products } from 'types';
import { formatPrice } from 'utils';
export const ProductCard = ({ product }: { product: Products }) => {
    const inStock = product.stock_quantity > 0;
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(`/products/${product.id}`)}
            className="relative overflow-hidden rounded-2xl bg-white shadow-sm"
            style={{ opacity: inStock ? 1 : 0.5 }}
        >
            <div
                className={`absolute right-2 top-2 z-10 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${inStock ? "bg-[#22C55E]" : "bg-[#EF4444]"
                    }`}
            >
                {inStock ? "Còn hàng" : "Hết hàng"}
            </div>

            <img
                src={product.images?.[0]}
                alt={product.name}
                className={`h-32 w-full object-cover ${!inStock ? "grayscale" : ""}`}
            />

            <div className="p-3">
                <p className="line-clamp-1 text-sm font-semibold text-text-main">{product.name}</p>
                <p className="mt-1 text-sm font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
        </div>
    );
}