import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserInfo } from "zmp-sdk/apis";
import { motion } from "motion/react";
import { AiOutlineGift, AiOutlineReload } from "react-icons/ai";
import { ConditionalRender } from "components/common";
import { ConfirmDialog, Emptier, ModalSuccess } from "components/ui";
import { QUERY_KEY } from "constant";
import { useClaimPromotion, useGetActivePromotions, useGetUserPromotions } from "queries";
import { PromotionCard, UserPromotionCard } from "./components";
import { EmptyVoucherIcon } from "components/icons";
import { Promotions } from "types";
import { getFriendlyErrorMessage, showErrorToast } from "utils";

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
  const [claimConfirmPromotion, setClaimConfirmPromotion] = useState<Promotions | null>(null);
  const { data: promotions, isLoading: isLoadingPromotions, isFetching: isFetchingPromotions, isError: isPromotionsError, refetch: refetchPromotions } =
    useGetActivePromotions();
  const { data: userPromotions, isLoading: isLoadingUserPromotions, isFetching: isFetchingUserPromotions, isError: isUserPromotionsError, refetch: refetchUserPromotions } =
    useGetUserPromotions({ zaloUserId });
  const { mutate: claimPromotion, isPending: isClaiming } = useClaimPromotion();

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => {
        if (userInfo.id) {
          setZaloUserId(userInfo.id);
        }
      })
      .catch(() => {
        setUserInfoError(true);
        showErrorToast("Chưa lấy được thông tin Zalo, bạn thử cấp quyền lại nhé.");
      });
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

  const handleRequestClaimPromotion = (promotion: Promotions) => {
    if (!zaloUserId) {
      setUserInfoError(true);
      showErrorToast("Bạn cần cấp quyền thông tin Zalo trước khi đổi voucher.");
      return;
    }

    setClaimConfirmPromotion(promotion);
  };

  const handleClaimPromotion = () => {
    if (!zaloUserId || !claimConfirmPromotion) return;

    claimPromotion(
      { promotionId: claimConfirmPromotion.id, zaloUserId },
      {
        onSuccess: async () => {
          setClaimConfirmPromotion(null);
          setIsSuccessVisible(true);
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_USER_PROMOTIONS] });
          await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PROMOTIONS] });
          await queryClient.refetchQueries({ queryKey: [QUERY_KEY.GET_USER_PROMOTIONS] });
          setActiveTab("claimed");
        },
        onError: (err) => {
          showErrorToast(`Đổi voucher thất bại: ${getFriendlyErrorMessage(err)}`);
        },
      },
    );
  };

  const isLoading = isLoadingPromotions || (Boolean(zaloUserId) && isLoadingUserPromotions);
  const isRefreshing = isFetchingPromotions || isFetchingUserPromotions;
  const isError = isPromotionsError || (activeTab !== "available" && isUserPromotionsError);
  const currentItems =
    activeTab === "available"
      ? availablePromotions
      : activeTab === "claimed"
        ? claimedPromotions
        : usedPromotions;

  return (
    <main className="h-full bg-background-main px-5 pt-4">
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
              Ví ưu đãi
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-title-text">Ưu đãi</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await refetchPromotions();
              if (zaloUserId) {
                await refetchUserPromotions();
              }
            }}
            disabled={isRefreshing}
            className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-extrabold text-title-text shadow-sm ring-1 ring-text-main/5 disabled:text-text-muted"
          >
            <AiOutlineReload className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Đang cập nhật" : "Cập nhật"}
          </button>
        </div>
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
      <ConditionalRender
        isLoading={isLoading}
        isError={isError}
        isEmpty={currentItems.length === 0}
        onRefresh={refetchPromotions}
        emptyRender={
          <Emptier
            icon={<EmptyVoucherIcon />}
            compact
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
                onAction={() => handleRequestClaimPromotion(promotion)}
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

      <ConfirmDialog
        visible={Boolean(claimConfirmPromotion)}
        icon={<AiOutlineGift />}
        title="Đổi voucher?"
        description={
          claimConfirmPromotion
            ? `Bạn muốn đổi mã ${claimConfirmPromotion.code} để dùng cho đơn hàng sắp tới chứ?`
            : ""
        }
        confirmText="Đổi voucher"
        cancelText="Để sau"
        isLoading={isClaiming}
        onCancel={() => setClaimConfirmPromotion(null)}
        onConfirm={handleClaimPromotion}
      />
    </main>
  );
};
