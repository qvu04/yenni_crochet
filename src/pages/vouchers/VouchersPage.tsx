import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserInfo } from "zmp-sdk/apis";
import { motion } from "motion/react";
import { ConditionalRender } from "components/common";
import { Emptier, ModalSuccess } from "components/ui";
import { QUERY_KEY } from "constant";
import { useClaimPromotion, useGetActivePromotions, useGetUserPromotions } from "queries";
import { PromotionCard, UserPromotionCard } from "./components";

type VoucherTab = "available" | "claimed" | "used";
const voucherTabs: { label: string; value: VoucherTab }[] = [
  { label: "Ưu đãi", value: "available" },
  { label: "Đã đổi", value: "claimed" },
  { label: "Đã dùng", value: "used" },
];

export const VouchersPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<VoucherTab>("available");
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [zaloUserId, setZaloUserId] = useState<string>();
  const [userInfoError, setUserInfoError] = useState(false);
  const { data: promotions, isLoading: isLoadingPromotions, isError: isPromotionsError, refetch: refetchPromotions } =
    useGetActivePromotions();
  const { data: userPromotions, isLoading: isLoadingUserPromotions, isError: isUserPromotionsError } =
    useGetUserPromotions({ zaloUserId });
  const { mutate: claimPromotion, isPending: isClaiming, error: claimError } = useClaimPromotion();

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => {
        if (userInfo.id) {
          setZaloUserId(userInfo.id);
        }
      })
      .catch(() => setUserInfoError(true));
  }, []);

  const claimedPromotionIds = useMemo(() => {
    return new Set(userPromotions?.map((item) => item.promotion_id) ?? []);
  }, [userPromotions]);

  const availablePromotions = useMemo(() => {
    return (promotions ?? []).filter((promotion) => {
      const isUsedUp = Boolean(promotion.usage_limit && promotion.used_count >= promotion.usage_limit);
      return !claimedPromotionIds.has(promotion.id) && !isUsedUp;
    });
  }, [claimedPromotionIds, promotions]);

  const claimedPromotions = useMemo(() => {
    return (userPromotions ?? []).filter((promotion) => promotion.status === "claimed");
  }, [userPromotions]);

  const usedPromotions = useMemo(() => {
    return (userPromotions ?? []).filter((promotion) => promotion.status === "used");
  }, [userPromotions]);

  const handleClaimPromotion = (promotionId: string) => {
    if (!zaloUserId) {
      setUserInfoError(true);
      return;
    }

    claimPromotion(
      { promotionId, zaloUserId },
      {
        onSuccess: async () => {
          setIsSuccessVisible(true);
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_USER_PROMOTIONS] });
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PROMOTIONS] });
          await queryClient.refetchQueries({ queryKey: [QUERY_KEY.GET_USER_PROMOTIONS] });
          setActiveTab("claimed");
        },
      },
    );
  };

  const isLoading = isLoadingPromotions || (Boolean(zaloUserId) && isLoadingUserPromotions);
  const isError = isPromotionsError || (activeTab !== "available" && isUserPromotionsError);
  const currentItems =
    activeTab === "available"
      ? availablePromotions
      : activeTab === "claimed"
        ? claimedPromotions
        : usedPromotions;

  return (
    <main className="min-h-screen mt-5 bg-background-main px-5 py-10">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
          Ví ưu đãi
        </p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-title-text">Ưu đãi</h1>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          Nhận voucher và dùng cho những đơn hàng handmade sắp tới.
        </p>
      </header>

      <div className="mb-4 grid grid-cols-3 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-text-main/5">
        {voucherTabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <motion.button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`relative min-h-10 overflow-hidden rounded-xl px-2 py-2 text-sm font-extrabold transition ${isActive ? "text-text-main" : "text-text-muted"
                }`}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              {isActive && (
                <motion.span
                  layoutId="voucherTabIndicator"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <motion.span
                className="relative z-10 block"
                animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.02 : 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {userInfoError && (
        <div className="mb-4 rounded-2xl bg-white p-4 text-sm leading-6 text-text-muted shadow-sm ring-1 ring-text-main/5">
          Chưa lấy được thông tin Zalo, bạn vẫn có thể xem ưu đãi nhưng cần cấp quyền để đổi voucher.
        </div>
      )}
      {isUserPromotionsError && activeTab === "available" && (
        <div className="mb-4 rounded-2xl bg-white p-4 text-sm leading-6 text-text-muted shadow-sm ring-1 ring-text-main/5">
          Chưa tải được ví voucher của bạn, danh sách bên dưới có thể vẫn bao gồm voucher đã đổi.
        </div>
      )}
      {claimError && (
        <div className="mb-4 rounded-2xl bg-[#FEE2E2] p-4 text-sm leading-6 text-[#B91C1C]">
          Đổi voucher thất bại: {claimError.message}
        </div>
      )}

      <ConditionalRender
        isLoading={isLoading}
        isError={isError}
        isEmpty={currentItems.length === 0}
        onRefresh={refetchPromotions}
        emptyRender={
          <Emptier
            title={
              activeTab === "available"
                ? "Chưa có ưu đãi mới"
                : activeTab === "claimed"
                  ? "Chưa có voucher đã đổi"
                  : "Chưa có voucher đã dùng"
            }
            description="Yenni Crochet sẽ cập nhật thêm ưu đãi mới tại đây."
          />
        }
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="space-y-4 pb-6"
        >
          {activeTab === "available" &&
            availablePromotions.map((promotion) => (
              <PromotionCard
                key={promotion.id}
                promotion={promotion}
                actionLabel="Đổi voucher"
                isActionLoading={isClaiming}
                onAction={() => handleClaimPromotion(promotion.id)}
              />
            ))}

          {activeTab === "claimed" &&
            claimedPromotions.map((userPromotion) => (
              <UserPromotionCard key={userPromotion.id} userPromotion={userPromotion} />
            ))}

          {activeTab === "used" &&
            usedPromotions.map((userPromotion) => (
              <UserPromotionCard key={userPromotion.id} userPromotion={userPromotion} />
            ))}
        </motion.div>
      </ConditionalRender>
      <ModalSuccess
        visible={isSuccessVisible}
        heading="Đổi ưu đãi thành công"
        title="Chúc mừng bạn đã đổi ưu đãi! Yenni chúc bạn mua sắm vui vẻ"
        onClose={() => setIsSuccessVisible(false)}
      />
    </main>
  );
};
