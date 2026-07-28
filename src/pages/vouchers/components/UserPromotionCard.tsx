import { UserPromotions } from 'types';
import { formatDate } from 'utils';
import { PromotionCard } from './PromotionCard';
export const UserPromotionCard = ({ userPromotion }: { userPromotion: UserPromotions }) => {
    if (!userPromotion.promotion) return null;

    return (
        <PromotionCard
            promotion={userPromotion.promotion}
            footer={
                userPromotion.status === "used"
                    ? `Đã dùng${userPromotion.used_at ? ` ngày ${formatDate(userPromotion.used_at)}` : ""}`
                    : `Đã đổi ngày ${formatDate(userPromotion.claimed_at)}`
            }
        />
    );
};
