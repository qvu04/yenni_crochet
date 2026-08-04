import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper } from 'antd-mobile';
import { formatPrice, formatProductDescription, getFriendlyErrorMessage, getMatchedPriceTier, getStockLabel, getVisiblePriceTiers, resolveUnitPrice, showErrorToast, showSuccessToast } from 'utils';
import { useGetProductById, useIsProductFavorited, useToggleFavoriteProduct } from 'queries';
import { CloseButtonSheet, ProductDetailSkeleton } from 'components/ui';
import { useCartStore } from 'stores/cart';
import { useFlyToCartStore } from 'stores/flyToCart';
import { AiFillHeart, AiOutlineHeart, AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { ProductVariant } from 'types';
import { DescriptionToggleIcon } from 'components/icons';
import { useZaloCustomerProfile } from 'hooks/useZaloCustomerProfile';

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
    const { profile } = useZaloCustomerProfile();
    const { data: isFavorited } = useIsProductFavorited({
        zaloUserId: profile?.zalo_user_id,
        productId,
    });
    const { mutate: toggleFavorite, isPending: isTogglingFavorite } = useToggleFavoriteProduct();
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
    const priceTiers = product?.product_price_tiers ?? [];
    const visiblePriceTiers = getVisiblePriceTiers({
        priceTiers,
        variantId: selectedVariant?.id,
    });
    const displayBasePrice = selectedVariant?.price ?? product?.price ?? 0;
    const matchedPriceTier = getMatchedPriceTier({
        priceTiers,
        quantity,
        variantId: selectedVariant?.id,
    });
    const displayPrice = resolveUnitPrice({
        basePrice: displayBasePrice,
        priceTiers,
        quantity,
        variantId: selectedVariant?.id,
    });
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
        showSuccessToast("Đã thêm sản phẩm vào giỏ hàng.");

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

    const handleToggleFavorite = () => {
        if (!profile?.zalo_user_id) {
            showErrorToast("Bạn mở tab Tài khoản để cấp quyền Zalo trước khi lưu wishlist nhé.");
            return;
        }

        toggleFavorite(
            {
                zaloUserId: profile.zalo_user_id,
                productId,
            },
            {
                onSuccess: (result) => {
                    showSuccessToast(result.is_favorited ? "Đã thêm vào wishlist." : "Đã bỏ khỏi wishlist.");
                },
                onError: (err) => {
                    showErrorToast(`Cập nhật wishlist thất bại: ${getFriendlyErrorMessage(err)}`);
                },
            },
        );
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
                            <div className="min-w-0 flex-1">
                                <p className="font-heading text-xl font-bold text-title-text">{product.name} - {formatPrice(displayPrice)}</p>
                                {matchedPriceTier && displayBasePrice !== displayPrice && (
                                    <p className="mt-1 text-xs font-bold text-text-muted">
                                        Giá lẻ <span className="line-through">{formatPrice(displayBasePrice)}</span>
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                disabled={isTogglingFavorite}
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl shadow-sm ring-1 ring-text-main/10 transition active:scale-95 disabled:opacity-60 ${isFavorited ? "text-[#B91C1C]" : "text-title-text"
                                    }`}
                                aria-label={isFavorited ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
                            >
                                {isFavorited ? <AiFillHeart /> : <AiOutlineHeart />}
                            </button>
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
                                    <p className="text-sm font-bold text-text-main">
                                        Màu: <span className="text-text-muted">{selectedVariant?.color_name || selectedVariant?.name || "Chọn màu"}</span>
                                    </p>
                                    {selectedVariant && (
                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold text-white ${selectedVariant.stock_quantity > 0 ? "bg-[#22C55E]" : "bg-[#EF4444]"
                                                }`}
                                        >
                                            {getStockLabel(selectedVariant.stock_quantity)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3">
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
                                                className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                                            >
                                                <span
                                                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${isSelected
                                                        ? "ring-2 ring-title-text ring-offset-2 ring-offset-white"
                                                        : "ring-1 ring-text-main/10"
                                                        } ${!isVariantInStock ? "opacity-40" : ""}`}
                                                >
                                                    {variant.color_hex ? (
                                                        <span
                                                            className="h-full w-full rounded-full"
                                                            style={{ backgroundColor: variant.color_hex }}
                                                        />
                                                    ) : variantImages[0] ? (
                                                        <img
                                                            src={variantImages[0]}
                                                            alt={variant.name}
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="flex h-full w-full items-center justify-center rounded-full bg-background-main text-[10px] font-bold text-text-muted">
                                                            {(variant.color_name || variant.name).slice(0, 2)}
                                                        </span>
                                                    )}

                                                    {!isVariantInStock && (
                                                        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/50" />
                                                    )}

                                                    {isSelected && (
                                                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-title-text text-[10px] font-bold text-white shadow-sm">
                                                            ✓
                                                        </span>
                                                    )}
                                                </span>
                                                <span
                                                    className={`max-w-[64px] truncate text-[11px] font-semibold ${isSelected ? "text-text-main" : "text-text-muted"
                                                        }`}
                                                >
                                                    {variant.color_name || variant.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {visiblePriceTiers.length > 0 && (
                            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-text-main">Giá sỉ khi bạn mua theo cột mốc</p>
                                        <p className="mt-1 text-xs font-semibold text-text-muted">
                                            Giá sẽ tự áp dụng theo số lượng bạn chọn.
                                        </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-title-text">
                                        Giá tốt
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {visiblePriceTiers.map((tier) => {
                                        const isMatched = matchedPriceTier?.id === tier.id;

                                        return (
                                            <div
                                                key={tier.id}
                                                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${isMatched
                                                    ? "bg-white ring-2 ring-title-text"
                                                    : "bg-background-main text-text-muted"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${isMatched ? "text-text-main" : ""}`}>
                                                        Từ {tier.min_quantity}
                                                        {tier.max_quantity ? `-${tier.max_quantity}` : "+"} cái
                                                    </span>
                                                    {isMatched && (
                                                        <span className="rounded-full bg-title-text px-2 py-0.5 text-[9px] font-bold text-white">
                                                            Đang áp dụng
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`font-heading font-extrabold ${isMatched ? "text-title-text" : ""}`}>
                                                    {formatPrice(tier.unit_price)}/cái
                                                </span>
                                            </div>
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
                            {matchedPriceTier && (
                                <p className="mt-2 rounded-2xl bg-primary/50 px-3 py-2 text-[10px] font-bold leading-5 text-title-text">
                                    Shop áp dụng giá sỉ từ {matchedPriceTier.min_quantity}
                                    {matchedPriceTier.max_quantity ? `-${matchedPriceTier.max_quantity}` : "+"} sản phẩm:
                                    {" "}{formatPrice(matchedPriceTier.unit_price)}/cái
                                </p>
                            )}
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
                                        className="mt-1 flex w-full items-center justify-center gap-1 py-2 text-xs font-bold text-text-muted transition active:opacity-60"
                                    >
                                        {isDescriptionExpanded ? "Thu gọn" : "Xem thêm"}
                                        <DescriptionToggleIcon
                                            className={`h-3.5 w-3.5 transition-transform ${isDescriptionExpanded ? "rotate-180" : ""}`}
                                        />
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
