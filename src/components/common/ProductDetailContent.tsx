import { useState } from 'react';
import { Icon } from 'zmp-ui';
import { formatPrice, getStockLabel } from 'utils';
import { OrderForm } from './OrderForm';
import { useGetProductById } from 'queries';

interface ProductDetailContentProps {
    productId: string;
    onClose: () => void;
    onOrderSuccess: () => void;
}

type Step = "detail" | "form";

export const ProductDetailContent = ({ productId, onClose, onOrderSuccess }: ProductDetailContentProps) => {
    const { data: product, isLoading, isError } = useGetProductById({ id: productId });
    const [step, setStep] = useState<Step>("detail");

    const closeButton = (
        <button
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-text-main shadow-sm backdrop-blur"
        >
            <Icon icon="zi-close" />
        </button>
    );

    if (isLoading) {
        return (
            <div className="relative p-5">
                {closeButton}
                <div className="h-72 w-full animate-pulse rounded-2xl bg-background-main" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="relative p-5">
                {closeButton}
                <p className="rounded-2xl bg-background-main p-4 text-sm text-text-muted">
                    Không tìm thấy sản phẩm này.
                </p>
            </div>
        );
    }

    if (step === "form") {
        return (
            <div className="relative h-full">
                {closeButton}
                <OrderForm
                    product={product}
                    onCancel={() => setStep("detail")}
                    onSuccess={onOrderSuccess}
                />
            </div>
        );
    }

    const inStock = product.stock_quantity > 0;

    return (
        <div className="relative flex h-full flex-col">
            {closeButton}
            <div className="flex-1 overflow-y-auto bg-background-main">
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className={`h-72 w-full object-cover ${!inStock ? "grayscale" : ""}`}
                />

                <div className="space-y-4 px-5 pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-heading text-xl font-bold text-title-text">{product.name}</p>
                            <p className="mt-1 text-lg font-bold text-text-main">{formatPrice(product.price)}</p>
                        </div>
                        <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white ${inStock ? "bg-[#22C55E]" : "bg-[#EF4444]"
                                }`}
                        >
                            {getStockLabel(product.stock_quantity)}
                        </span>
                    </div>

                    {product.estimated_days && (
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-title-text">
                            Đặt trước {product.estimated_days}
                        </span>
                    )}

                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
                        <p className="text-xs font-bold uppercase text-text-muted">Tồn kho hiện tại</p>
                        <p className={`mt-1 text-sm font-bold ${inStock ? "text-text-main" : "text-[#B91C1C]"}`}>
                            {getStockLabel(product.stock_quantity)}
                        </p>
                    </div>

                    <p className="text-sm leading-relaxed text-text-muted">{product.description}</p>
                </div>
            </div>

            <div className="border-none border-background-main bg-background-main p-4">
                <button
                    disabled={!inStock}
                    onClick={() => setStep("form")}
                    className={`w-full rounded-2xl py-3 text-center text-base font-bold ${inStock ? "bg-primary text-text-main" : "bg-text-muted text-white"
                        }`}
                >
                    {inStock ? `Đặt hàng (${product.stock_quantity} còn lại)` : "Hết hàng"}
                </button>
            </div>
        </div>
    );
};
