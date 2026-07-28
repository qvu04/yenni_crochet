import { Promotions, StatusUserPromotion, UserPromotions } from "types";
import { supabase } from "./supabase";

interface ClaimPromotionInput {
    promotionId: string;
    zaloUserId: string;
}

export const voucherServices = {
    getActivePromotions: async (): Promise<Promotions[]> => {
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabase
            .from("promotions")
            .select("*")
            .eq("is_active", true)
            .lte("start_date", today)
            .gte("end_date", today)
            .order("created_at", { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    },

    getUserPromotions: async (zaloUserId: string, status?: StatusUserPromotion): Promise<UserPromotions[]> => {
        const { data, error } = await supabase.rpc("get_user_promotions", {
            p_zalo_user_id: zaloUserId,
            p_status: status ?? null,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data as UserPromotions[];
    },

    claimPromotion: async ({ promotionId, zaloUserId }: ClaimPromotionInput): Promise<void> => {
        const { error } = await supabase.rpc("claim_user_promotion", {
            p_promotion_id: promotionId,
            p_zalo_user_id: zaloUserId,
        });

        if (error) {
            throw new Error(error.message);
        }
    },
};
