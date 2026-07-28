import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { voucherServices } from "services";
import { Promotions, StatusUserPromotion, UserPromotions } from "types";

interface UseGetActivePromotionsProps {
    options?: UseQueryOptions<Promotions[], Error>;
}

export const useGetActivePromotions = ({ options }: UseGetActivePromotionsProps = {}) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_ACTIVE_PROMOTIONS],
        queryFn: voucherServices.getActivePromotions,
        ...options,
    });
};

interface UseGetUserPromotionsProps {
    zaloUserId?: string;
    status?: StatusUserPromotion;
    options?: UseQueryOptions<UserPromotions[], Error>;
}

export const useGetUserPromotions = ({ zaloUserId, status, options }: UseGetUserPromotionsProps) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_USER_PROMOTIONS, zaloUserId, status ?? "all"],
        queryFn: async () => {
            if (!zaloUserId) {
                throw new Error("Thiếu Zalo user id");
            }

            return voucherServices.getUserPromotions(zaloUserId, status);
        },
        enabled: Boolean(zaloUserId),
        ...options,
    });
};

interface ClaimPromotionInput {
    promotionId: string;
    zaloUserId: string;
}

interface UseClaimPromotionProps {
    options?: UseMutationOptions<void, Error, ClaimPromotionInput>;
}

export const useClaimPromotion = ({ options }: UseClaimPromotionProps = {}) => {
    return useMutation({
        mutationFn: voucherServices.claimPromotion,
        ...options,
    });
};
