// components/FeaturedProductRow.tsx
import { ConditionalRender, ProductCard } from "components/common";
import { EmptyProductIcon } from "components/icons";
import { Emptier, ProductRowSkeleton } from "components/ui";
import { useGetFeaturedProductsByType } from "queries";
import { ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProductType } from "types";

interface FeaturedProductRowProps {
    title: string;
    productType?: ProductType;
    preOrder?: boolean;
    showTypeBadge?: boolean;
    icon?: ReactNode;
}

const AUTO_SLIDE_INTERVAL = 3000;
const RESUME_DELAY = 3000;
const MIN_ITEMS_FOR_AUTOPLAY = 3;

export const FeaturedProductRow = ({ title, productType, preOrder, showTypeBadge = true, icon }: FeaturedProductRowProps) => {
    const { data: products, isLoading, isError } = useGetFeaturedProductsByType({ productType, preOrder });
    const navigate = useNavigate();
    const contentRef = useRef<HTMLDivElement | null>(null);

    const seeAllPath = preOrder
        ? "/products?type=pre_order"
        : productType
            ? `/products?type=${productType}`
            : "/products";

    useEffect(() => {
        const contentElement = contentRef.current;

        if (!contentElement || isLoading || !products || products.length < MIN_ITEMS_FOR_AUTOPLAY) return;

        const cards = Array.from(contentElement.children).filter(
            (child): child is HTMLElement => child instanceof HTMLElement,
        );

        if (cards.length < MIN_ITEMS_FOR_AUTOPLAY) return;

        let intervalId: number | undefined;
        let resumeTimeoutId: number | undefined;

        const getScrollTargetFor = (card: HTMLElement) => {
            const containerRect = contentElement.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            return contentElement.scrollLeft + (cardRect.left - containerRect.left);
        };

        const getCurrentIndex = () => {
            let closestIndex = 0;
            let closestDistance = Infinity;

            cards.forEach((card, i) => {
                const distance = Math.abs(getScrollTargetFor(card) - contentElement.scrollLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            });

            return closestIndex;
        };

        const stopAutoSlide = () => {
            if (intervalId) {
                window.clearInterval(intervalId);
                intervalId = undefined;
            }
        };

        const startAutoSlide = () => {
            if (intervalId) return;

            const getMaxScrollLeft = () => contentElement.scrollWidth - contentElement.clientWidth;

            intervalId = window.setInterval(() => {
                const maxScrollLeft = getMaxScrollLeft();
                const isAtEnd = contentElement.scrollLeft >= maxScrollLeft - 1;

                const nextIndex = isAtEnd ? 0 : (getCurrentIndex() + 1) % cards.length;

                contentElement.scrollTo({
                    left: isAtEnd ? 0 : getScrollTargetFor(cards[nextIndex]),
                    behavior: "smooth",
                });
            }, AUTO_SLIDE_INTERVAL);
        };

        const scheduleResume = () => {
            if (resumeTimeoutId) {
                window.clearTimeout(resumeTimeoutId);
            }

            resumeTimeoutId = window.setTimeout(() => {
                startAutoSlide();
            }, RESUME_DELAY);
        };

        const handleUserInteraction = () => {
            stopAutoSlide();
            scheduleResume();
        };

        startAutoSlide();

        contentElement.addEventListener("touchstart", handleUserInteraction, { passive: true });
        contentElement.addEventListener("touchmove", handleUserInteraction, { passive: true });
        contentElement.addEventListener("mousedown", handleUserInteraction);
        contentElement.addEventListener("wheel", handleUserInteraction, { passive: true });

        return () => {
            stopAutoSlide();

            if (resumeTimeoutId) {
                window.clearTimeout(resumeTimeoutId);
            }

            contentElement.removeEventListener("touchstart", handleUserInteraction);
            contentElement.removeEventListener("touchmove", handleUserInteraction);
            contentElement.removeEventListener("mousedown", handleUserInteraction);
            contentElement.removeEventListener("wheel", handleUserInteraction);
        };
    }, [isLoading, products]);

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
                loadingRender={<ProductRowSkeleton />}
                errorRender={
                    <p className="rounded-2xl bg-white/70 p-4 text-sm text-text-muted">
                        Không tải được sản phẩm, thử lại sau nhé.
                    </p>
                }
                emptyRender={
                    <Emptier
                        icon={<EmptyProductIcon />}
                        title="Chưa có sản phẩm phù hợp"
                        description="Yenni sẽ cập nhật thêm mẫu mới sớm nhé."
                        compact
                        className="min-h-36 rounded-2xl bg-white/70 py-5"
                    />
                }
            >
                <div ref={contentRef} className="scrollbar-none flex min-h-[270px] snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
                    {products?.map((product) => (
                        <div
                            key={product.id}
                            className="w-[40%] min-w-[150px] max-w-[176px] shrink-0 snap-start"
                        >
                            <ProductCard product={product} showProductTypeBadge={showTypeBadge} />
                        </div>
                    ))}
                </div>
            </ConditionalRender>
        </div>
    );
};
