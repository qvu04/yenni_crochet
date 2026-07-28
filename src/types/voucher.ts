export type DiscountTypePromotion = "percent" | "fixed" | "free_shipping";
export interface Promotions {
    id: string;
    title: string;
    description: string | null;
    code: string;
    discount_type: DiscountTypePromotion;
    discount_value: number;
    min_order_value: number | null;
    banner_url: string | null;
    campaign_id: string | null;
    start_date: string;
    end_date: string;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    max_order_value: number | null;
    max_discount_value: number | null;
}
export type StatusUserPromotion = "claimed" | "used" | "expired";
export interface UserPromotions {
    id: string;
    promotion_id: string;
    zalo_user_id: string;
    status: StatusUserPromotion;
    claimed_at: string;
    used_at: string | null;
    order_id: string | null;
    created_at: string;
    promotion?: Promotions;
}