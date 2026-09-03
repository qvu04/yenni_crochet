import { describe, expect, it } from "vitest";
import { type Promotions } from "types";
import { calculatePromotionDiscount } from "./voucher";

const createPromotion = (overrides: Partial<Promotions> = {}): Promotions => ({
    id: "promotion-1",
    title: "Giảm giá test",
    description: null,
    code: "TEST",
    discount_type: "fixed",
    discount_value: 20000,
    min_order_value: null,
    banner_url: null,
    campaign_id: null,
    start_date: "2026-01-01T00:00:00Z",
    end_date: "2026-12-31T23:59:5999Z",
    usage_limit: null,
    used_count: 0,
    is_active: true,
    max_order_value: null,
    max_discount_value: null,
    ...overrides,
})
describe("calculatePromotionDiscount", () => {
    it("calculates fixed discount", () => {
        const promotion = createPromotion({
            discount_type: "fixed",
            discount_value: 20000,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 20000,
            finalPrice: 80000,
            unavailableReason: null,
        });
    });
    it("calculates percent discount", () => {
        const promotion = createPromotion({
            discount_type: "percent",
            discount_value: 20,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 20000,
            finalPrice: 80000,
            unavailableReason: null
        });
    });
    it("applies discount shipping type", () => {
        const promotion = createPromotion({
            discount_type: "free_shipping",
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 0,
            finalPrice: 100000,
            unavailableReason: null
        });
    });
    it("applies max discount value for percent discount", () => {
        const promotion = createPromotion({
            discount_type: "percent",
            discount_value: 50,
            max_discount_value: 30000,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 30000,
            finalPrice: 70000,
            unavailableReason: null
        });
    });
    it("applies fixed discount with discount Amount does not exceed subtotal", () => {
        const promotion = createPromotion({
            discount_type: "fixed",
            discount_value: 150000,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 100000,
            finalPrice: 0,
            unavailableReason: null
        });
    });
    it("subtotal less than min order value will not apply voucher", () => {
        const promotion = createPromotion({
            discount_type: "fixed",
            discount_value: 20000,
            min_order_value: 150000,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 0,
            finalPrice: 100000,
            unavailableReason: "Áp dụng cho đơn từ 150.000đ"
        });
    });
    it("subtotal greater than max order value will not apply voucher", () => {
        const promotion = createPromotion({
            discount_type: "fixed",
            discount_value: 20000,
            max_order_value: 1000000,
        });
        const result = calculatePromotionDiscount(promotion, 1500000);
        expect(result).toEqual({
            discountAmount: 0,
            finalPrice: 1500000,
            unavailableReason: "Chỉ áp dụng cho đơn tối đa 1.000.000đ"
        });
    });
    it("voucher usage limit reached will not apply voucher", () => {
        const promotion = createPromotion({
            discount_type: "percent",
            discount_value: 20,
            usage_limit: 100,
            used_count: 100,
        });
        const result = calculatePromotionDiscount(promotion, 100000);
        expect(result).toEqual({
            discountAmount: 0,
            finalPrice: 100000,
            unavailableReason: "Voucher đã hết lượt sử dụng",
        });
    });
});