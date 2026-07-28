import { Promotions } from 'types';
import { formatPrice } from 'utils';

export const formatDiscount = (promotion: Promotions) => {
    if (promotion.discount_type === "free_shipping") return "Freeship";
    if (promotion.discount_type === "percent") return `Giảm ${promotion.discount_value}%`;
    return `Giảm ${formatPrice(promotion.discount_value)}`;
};

export const getPromotionConditions = (promotion: Promotions) => {
    const conditions: string[] = [];

    if (promotion.min_order_value) {
        conditions.push(`Đơn từ ${formatPrice(promotion.min_order_value)}`);
    }

    if (promotion.max_order_value) {
        conditions.push(`Tối đa đơn ${formatPrice(promotion.max_order_value)}`);
    }

    if (promotion.max_discount_value) {
        conditions.push(`Giảm tối đa ${formatPrice(promotion.max_discount_value)}`);
    }

    if (promotion.usage_limit) {
        conditions.push(`Còn ${Math.max(0, promotion.usage_limit - promotion.used_count)} lượt`);
    }

    return conditions;
};

export const getPromotionUnavailableReason = (promotion: Promotions, subtotal: number) => {
    if (promotion.min_order_value && subtotal < promotion.min_order_value) {
        return `Áp dụng cho đơn từ ${formatPrice(promotion.min_order_value)}`;
    }

    if (promotion.max_order_value && subtotal > promotion.max_order_value) {
        return `Chỉ áp dụng cho đơn tối đa ${formatPrice(promotion.max_order_value)}`;
    }

    if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
        return "Voucher đã hết lượt sử dụng";
    }

    return null;
};

export const calculatePromotionDiscount = (promotion: Promotions, subtotal: number) => {
    const unavailableReason = getPromotionUnavailableReason(promotion, subtotal);

    if (unavailableReason) {
        return {
            discountAmount: 0,
            finalPrice: subtotal,
            unavailableReason,
        };
    }

    let discountAmount = 0;

    if (promotion.discount_type === "percent") {
        discountAmount = Math.floor((subtotal * promotion.discount_value) / 100);

        if (promotion.max_discount_value) {
            discountAmount = Math.min(discountAmount, promotion.max_discount_value);
        }
    }

    if (promotion.discount_type === "fixed") {
        discountAmount = promotion.discount_value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return {
        discountAmount,
        finalPrice: subtotal - discountAmount,
        unavailableReason: null,
    };
};

export const copyToClipboard = async (
    text: string,
    options: {
        onSuccess?: () => void;
        onError?: (error: string | Error) => void;
    } = {}
): Promise<boolean> => {
    const { onSuccess, onError } = options;

    if (typeof text !== "string" || text.length === 0) {
        onError?.("Invalid input: Text must be a non-empty string");
        return false;
    }

    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        onSuccess?.();
        return true;
    } catch (error) {
        onError?.(error instanceof Error ? error : new Error(String(error)));
        return false;
    }
};
