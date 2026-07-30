import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper } from 'antd-mobile';
import { formatPrice, formatProductDescription, getStockLabel } from 'utils';
import { useGetProductById } from 'queries';
import { CloseButtonSheet, ProductDetailSkeleton } from 'components/ui';
import { useCartStore } from 'stores/cart';
import { useFlyToCartStore } from 'stores/flyToCart';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { ProductVariant } from 'types';

interface ProductDetailContentProps {
    productId: string;
    onClose: () => void;
}

const getVariantImages = (variant?: ProductVariant | null) => {
    if (!variant) return [];
    return variant.images?.filter((imageUrl) => Boolean(imageUrl.trim())) ?? [];
};

export const ProductDetailContent = ({ productId, onClose }: ProductDetailContentProps) => {
    const { data: product, isLoading, isError } = useGetProductById({ id: productId });
    const navigate = useNavigate();
    const addItem = useCartStore((state) => state.addItem);
    const triggerFlyToCart = useFlyToCartStore((state) => state.triggerFlyToCart);
    const [quantity, setQuantity] = useState(1);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [canToggleDescription, setCanToggleDescription] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string>();
    const descriptionRef = useRef<HTMLDivElement>(null);
    const productImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        setIsDescriptionExpanded(false);
        setQuantity(1);
        setSelectedVariantId(undefined);
    }, [productId]);

    useEffect(() => {
        if (!product) return;
        const variants = product.product_variants ?? [];
        const firstAvailableVariant = variants.find((variant) => variant.stock_quantity > 0) ?? variants[0];

        if (firstAvailableVariant && !selectedVariantId) {
            setSelectedVariantId(firstAvailableVariant.id);
        }
    }, [product, selectedVariantId]);

    const variants = product?.product_variants ?? [];
    const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? null;
    const selectedVariantImages = getVariantImages(selectedVariant);
    const displayImages = selectedVariantImages.length
        ? selectedVariantImages
        : product?.images?.length
            ? product.images
            : [];
    const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
    const displayStock = selectedVariant ? selectedVariant.stock_quantity : product?.stock_quantity ?? 0;

    useEffect(() => {
        if (!product) return;
        setQuantity((value) => Math.max(1, Math.min(displayStock, value)));
    }, [displayStock, product]);

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
        return <ProductDetailSkeleton onClose={onClose} />;
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

    const inStock = displayStock > 0;
    const descriptionHtml = formatProductDescription(product.description);

    const handleAddToCart = () => {
        const imageRect = productImageRef.current?.getBoundingClientRect();
        addItem(product, quantity, selectedVariant);
        onClose();

        if (imageRect && displayImages[0]) {
            window.setTimeout(() => {
                const cartTarget = document.querySelector('[data-floating-cart-target="true"]');
                if (!cartTarget) return;

                triggerFlyToCart({
                    src: displayImages[0],
                    alt: product.name,
                    startRect: {
                        top: imageRect.top,
                        left: imageRect.left,
                        width: imageRect.width,
                        height: imageRect.height,
                    },
                });
            }, 120);
        }
    };

    const handleBuyNow = () => {
        addItem(product, quantity, selectedVariant);
        onClose();
        navigate("/cart");
    };

    return (
        <>
            <div className="relative flex h-full min-h-0 flex-col">
                <CloseButtonSheet onClick={onClose} />
                <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-background-main [-webkit-overflow-scrolling:touch]">
                    {displayImages.length > 1 ? (
                        <Swiper
                            key={selectedVariant?.id ?? product.id}
                            loop
                            stuckAtBoundary={false}
                            indicator={(total, current) => (
                                <div className="absolute bottom-3 right-3 rounded-full bg-text-main/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                                    {current + 1}/{total}
                                </div>
                            )}
                            className="h-72 w-full bg-background-main"
                        >
                            {displayImages.map((imageUrl, index) => (
                                <Swiper.Item key={`${imageUrl}-${index}`}>
                                    <img
                                        ref={index === 0 ? productImageRef : undefined}
                                        src={imageUrl}
                                        alt={`${product.name} ${index + 1}`}
                                        className={`h-72 w-full object-cover ${!inStock ? "grayscale" : ""}`}
                                    />
                                </Swiper.Item>
                            ))}
                        </Swiper>
                    ) : displayImages[0] ? (
                        <img
                            key={selectedVariant?.id ?? product.id}
                            ref={productImageRef}
                            src={displayImages[0]}
                            alt={product.name}
                            className={`h-72 w-full object-cover bg-background-main ${!inStock ? "grayscale" : ""}`}
                        />
                    ) : (
                        <div className="flex h-72 w-full items-center justify-center bg-background-main px-5 text-center text-sm font-semibold text-text-muted">
                            Chưa có ảnh cho màu này
                        </div>
                    )}

                    <div className="space-y-4 px-5 pt-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-heading text-xl font-bold text-title-text">{product.name} - {formatPrice(displayPrice)}</p>
                                {/* <p className="mt-1 text-lg font-bold text-text-main">{}</p> */}
                            </div>
                            {/* <span
                                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-white ${inStock ? "bg-[#22C55E]" : "bg-[#EF4444]"
                                    }`}
                            >
                                {getStockLabel(displayStock)}
                            </span> */}
                        </div>

                        {product.estimated_days && (
                            <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold text-title-text">
                                Đặt trước {product.estimated_days}
                            </span>
                        )}

                        {variants.length > 0 && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-text-main">Chọn màu</p>
                                        <p className="mt-1 text-xs font-semibold text-center text-text-muted">
                                            {selectedVariant
                                                ? selectedVariant.color_name || selectedVariant.name
                                                : "Chọn phân loại bạn thích"}
                                        </p>
                                    </div>
                                    {selectedVariant && (
                                        <span className={`rounded-full px-4 py-2 text-[12px] font-bold text-white ${selectedVariant.stock_quantity > 0 ? "bg-[#22C55E]" : "bg-[#EF4444]"
                                            }`}>
                                            {getStockLabel(selectedVariant.stock_quantity)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {variants.map((variant) => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        const variantImages = getVariantImages(variant);
                                        const isVariantInStock = variant.stock_quantity > 0;

                                        return (
                                            <button
                                                key={variant.id}
                                                type="button"
                                                disabled={!isVariantInStock}
                                                onClick={() => {
                                                    setSelectedVariantId(variant.id);
                                                    setQuantity(1);
                                                }}
                                                className={`flex min-h-11 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${isSelected
                                                    ? "bg-primary text-text-main ring-2 ring-title-text/10"
                                                    : "bg-background-main text-text-muted ring-1 ring-text-main/5"
                                                    }`}
                                            >
                                                {variant.color_hex ? (
                                                    <span
                                                        className="h-5 w-5 shrink-0 rounded-full ring-2 ring-white shadow-sm"
                                                        style={{ backgroundColor: variant.color_hex }}
                                                    />
                                                ) : variantImages[0] ? (
                                                    <img
                                                        src={variantImages[0]}
                                                        alt={variant.name}
                                                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                                                    />
                                                ) : null}
                                                <span>{variant.color_name || variant.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-text-main">Số lượng</p>
                                    <p className="mt-1 text-xs font-semibold text-text-muted">
                                        {getStockLabel(displayStock)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-background-main px-2 py-1">
                                    <button
                                        type="button"
                                        disabled={!inStock || quantity <= 1}
                                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-main shadow-sm disabled:text-text-muted disabled:shadow-none"
                                    >
                                        <AiOutlineMinus />
                                    </button>
                                    <span className="w-8 text-center text-sm font-extrabold text-text-main">{quantity}</span>
                                    <button
                                        type="button"
                                        disabled={!inStock || quantity >= displayStock}
                                        onClick={() => setQuantity((value) => Math.min(displayStock, value + 1))}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-main shadow-sm disabled:text-text-muted disabled:shadow-none"
                                    >
                                        <AiOutlinePlus />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-background-main px-3 py-2 text-sm">
                                <span className="font-semibold text-text-muted">Tạm tính</span>
                                <span className="font-heading font-extrabold text-title-text">
                                    {formatPrice(displayPrice * quantity)}
                                </span>
                            </div>
                        </div>
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

                <div className={`border-none border-background-main bg-background-main p-4 ${inStock ? "grid grid-cols-[0.9fr_1.1fr] gap-3" : ""}`}>
                    {inStock ? (
                        <>
                            <button
                                onClick={handleAddToCart}
                                className="rounded-2xl bg-white py-3 text-center text-sm font-bold text-text-main ring-1 ring-text-main/10"
                            >
                                Thêm vào giỏ hàng
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="rounded-2xl bg-primary py-3 text-center text-base font-bold text-text-main"
                            >
                                Mua ngay
                            </button>
                        </>
                    ) : (
                        <button
                            disabled
                            className="w-full rounded-2xl bg-text-muted py-3 text-center text-base font-bold text-white"
                        >
                            Hết hàng
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
