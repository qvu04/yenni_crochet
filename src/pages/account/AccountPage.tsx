import { useEffect, useRef } from "react";
import { useZaloCustomerProfile } from "hooks/useZaloCustomerProfile";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useGetCustomerAccountSummary, useGetUserWishlist, useUpsertCustomerProfile } from "queries";
import { getFriendlyErrorMessage, handleAppError, showSuccessToast } from "utils";
import {
  AccountActivityPanel,
  AccountNotice,
  AccountOrderTrackerCard,
  AccountProfileCard,
  AccountStatsGrid,
  AccountWishlistSection,
  DepositPolicyCard,
} from "./components";

export const AccountPage = () => {
  const syncedProfileKeyRef = useRef<string>();
  const autoPhoneRequestRef = useRef(false);
  const {
    profile,
    isLoading: isLoadingProfile,
    error: profileError,
    refreshProfile,
  } = useZaloCustomerProfile();
  const { getPhone, getPhoneOnce, isLoading: isGettingPhone } = useZaloPhoneNumber();
  const {
    mutateAsync: upsertCustomerProfile,
    isPending: isSyncingProfile,
  } = useUpsertCustomerProfile();
  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useGetCustomerAccountSummary({
    zaloUserId: profile?.zalo_user_id,
  });
  const {
    data: wishlistItems,
    isLoading: isLoadingWishlist,
  } = useGetUserWishlist({
    zaloUserId: profile?.zalo_user_id,
  });

  useEffect(() => {
    if (!profile?.zalo_user_id) return;

    const profileKey = [
      profile.zalo_user_id,
      profile.display_name ?? "",
      profile.avatar_url ?? "",
    ].join("|");

    if (syncedProfileKeyRef.current === profileKey) return;
    syncedProfileKeyRef.current = profileKey;

    upsertCustomerProfile(profile).catch((err) => {
      handleAppError(err, {
        component: "AccountPage",
        action: "syncProfile",
        userMessage: `Đồng bộ tài khoản thất bại: ${getFriendlyErrorMessage(err)}`,
      });
    });
  }, [profile, upsertCustomerProfile]);

  useEffect(() => {
    if (!profile?.zalo_user_id || summary?.phone || autoPhoneRequestRef.current) return;

    autoPhoneRequestRef.current = true;

    getPhoneOnce().then((nextPhone) => {
      if (!nextPhone) return;

      upsertCustomerProfile({
        ...profile,
        phone: nextPhone,
      }).catch((err) => {
        handleAppError(err, {
          component: "AccountPage",
          action: "saveAutoPhone",
          silent: true,
        });
      });
    });
  }, [getPhoneOnce, profile, summary?.phone, upsertCustomerProfile]);

  const handleGetPhone = async () => {
    try {
      const nextPhone = await getPhone();

      if (!nextPhone) {
        handleAppError("Chưa lấy được số từ Zalo, bạn thử lại sau giúp shop nhé.", {
          component: "AccountPage",
          action: "getPhone",
        });
        return;
      }

      if (!profile?.zalo_user_id) {
        handleAppError("Chưa lấy được tài khoản Zalo để lưu số điện thoại.", {
          component: "AccountPage",
          action: "savePhoneWithoutProfile",
        });
        return;
      }

      await upsertCustomerProfile({
        ...profile,
        phone: nextPhone,
      });
      showSuccessToast("Đã lưu số điện thoại vào tài khoản.");
    } catch (err) {
      handleAppError(err, {
        component: "AccountPage",
        action: "getPhone",
        userMessage: `Lấy số điện thoại thất bại: ${getFriendlyErrorMessage(err)}`,
      });
    }
  };

  const handleRefresh = async () => {
    const refreshedProfile = await refreshProfile();

    if (refreshedProfile) {
      showSuccessToast("Đã làm mới thông tin tài khoản.");
    }
  };

  const errorMessage = profileError
    ? "Mini App chưa lấy được thông tin Zalo. Bạn có thể cấp quyền lại hoặc mở lại app để thử."
    : summaryError
      ? `Chưa tải được thống kê tài khoản: ${getFriendlyErrorMessage(summaryError)}`
      : null;

  return (
    <main className="min-h-screen bg-background-main pb-6">
      <header className="px-5 pb-4 pt-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-muted">Tài khoản</p>
        <h1 className="mt-1 font-heading text-[32px] font-extrabold leading-9 text-title-text">Thông tin của bạn</h1>
        {/* <p className="mt-2 text-sm font-semibold leading-6 text-text-muted">
          Theo dõi nhanh đơn hàng đã gửi cho Yenni Crochet.
        </p> */}
      </header>

      <div className="space-y-4 px-5">
        {errorMessage && <AccountNotice message={errorMessage} />}

        <AccountProfileCard
          profile={profile}
          summary={summary}
          isLoadingProfile={isLoadingProfile}
          isGettingPhone={isGettingPhone}
          isSyncing={isSyncingProfile}
          onGetPhone={handleGetPhone}
          onRefresh={handleRefresh}
        />

        <AccountStatsGrid
          summary={summary}
          isLoading={isLoadingSummary || isSyncingProfile}
        />

        <AccountOrderTrackerCard summary={summary} />

        <AccountWishlistSection
          items={wishlistItems}
          isLoading={isLoadingWishlist}
        />

        <DepositPolicyCard />

        <AccountActivityPanel summary={summary} />

        {/* <AccountNotice message="Lịch sử chi tiết đơn hàng, wishlist và địa chỉ mặc định sẽ dùng cùng dữ liệu tài khoản này ở bước tiếp theo." /> */}
      </div>
    </main>
  );
};
