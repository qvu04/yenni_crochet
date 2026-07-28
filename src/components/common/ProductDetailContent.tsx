import { useEffect, useRef, useState } from 'react';
import { Icon } from 'zmp-ui';
import { formatPrice, formatProductDescription, getStockLabel } from 'utils';
import { OrderForm } from './OrderForm';
import { useGetProductById } from 'queries';
import { CloseButtonSheet } from 'components/ui';

interface ProductDetailContentProps {
    productId: string;
    onClose: () => void;
    onOrderSuccess: () => void;
}

type Step = "detail" | "form";

export const ProductDetailContent = ({ productId, onClose, onOrderSuccess }: ProductDetailContentProps) => {
    const { data: product, isLoading, isError } = useGetProductById({ id: productId });
    const [step, setStep] = useState<Step>("detail");
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [canToggleDescription, setCanToggleDescription] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsDescriptionExpanded(false);
    }, [productId]);

    useEffect(() => {
        const descriptionElement = descriptionRef.current;
        if (!descriptionElement || !product?.description) {
            setCanToggleDescription(false);
            return;
        }

        const frameId = window.requestAnimationFrame(() => {
            setCanToggleDescription(descriptionElement.scrollHeight > 168);
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [product?.description]);

    if (isLoading) {
        return (
            <div className="relative p-5">
                <CloseButtonSheet onClick={onClose} />
                <div className="h-72 w-full animate-pulse rounded-2xl bg-background-main" />
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="relative p-5">
                <CloseButtonSheet onClick={onClose} />
                <p className="rounded-2xl bg-background-main p-4 text-sm text-text-muted">
                    Không tìm thấy sản phẩm này.
                </p>
            </div>
        );
    }

    if (step === "form") {
        return (
            <div className="relative h-full">
                <CloseButtonSheet onClick={onClose} />
                <OrderForm
                    product={product}
                    onCancel={() => setStep("detail")}
                    onSuccess={onOrderSuccess}
                />
            </div>
        );
    }

    const inStock = product.stock_quantity > 0;
    const descriptionHtml = formatProductDescription(product.description);

    return (
        <div className="relative flex h-full flex-col">
            <CloseButtonSheet onClick={onClose} />
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
                    {descriptionHtml && (
                        <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-text-main/5">
                            <div className="relative overflow-hidden">
                                <div
                                    ref={descriptionRef}
                                    className={`space-y-2 text-sm leading-6 text-text-muted transition-[max-height] duration-300 ease-out [&_p]:m-0 [&_p]:leading-6 [&_ul]:m-0 [&_ul]:space-y-2 [&_ul]:pl-5 [&_li]:list-disc [&_li]:pl-1 [&_li::marker]:text-primary ${canToggleDescription && !isDescriptionExpanded ? "max-h-40" : "max-h-[1200px]"
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                                />

                                {canToggleDescription && !isDescriptionExpanded && (
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-white/0" />
                                )}
                            </div>

                            {canToggleDescription && (
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionExpanded((value) => !value)}
                                    className="mt-2 w-full rounded-xl bg-primary/60 px-3 py-2 text-sm font-bold text-text-main transition active:scale-[0.99]"
                                >
                                    {isDescriptionExpanded ? "Ẩn bớt" : "Xem thêm"}
                                </button>
                            )}
                        </div>
                    )}
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
