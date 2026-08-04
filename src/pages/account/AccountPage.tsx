import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AiOutlineRight, AiOutlineShoppingCart } from "react-icons/ai";
import { useZaloCustomerProfile } from "hooks/useZaloCustomerProfile";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useGetCustomerAccountSummary, useGetUserWishlist, useUpsertCustomerProfile } from "queries";
import { getFriendlyErrorMessage, showErrorToast, showSuccessToast } from "utils";
import {
  AccountActivityPanel,
  AccountNotice,
  AccountProfileCard,
  AccountStatsGrid,
  AccountWishlistSection,
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
      showErrorToast(`Đồng bộ tài khoản thất bại: ${getFriendlyErrorMessage(err)}`);
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
      }).catch(() => {
      });
    });
  }, [getPhoneOnce, profile, summary?.phone, upsertCustomerProfile]);

  const handleGetPhone = async () => {
    try {
      const nextPhone = await getPhone();

      if (!nextPhone) {
        showErrorToast("Chưa lấy được số từ Zalo, bạn thử lại sau giúp shop nhé.");
        return;
      }

      if (!profile?.zalo_user_id) {
        showErrorToast("Chưa lấy được tài khoản Zalo để lưu số điện thoại.");
        return;
      }

      await upsertCustomerProfile({
        ...profile,
        phone: nextPhone,
      });
      showSuccessToast("Đã lưu số điện thoại vào tài khoản.");
    } catch (err) {
      showErrorToast(`Lấy số điện thoại thất bại: ${getFriendlyErrorMessage(err)}`);
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
    <main className="min-h-screen bg-background-main px-5 pb-6 pt-5">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase text-text-muted">Tài khoản</p>
        <h1 className="mt-1 font-heading text-3xl font-extrabold text-title-text">Thông tin của bạn</h1>
        <p className="mt-1 text-sm font-semibold leading-6 text-text-muted">
          Theo dõi nhanh đơn hàng và yêu cầu đặt riêng đã gửi cho Yenni Crochet.
        </p>
      </header>

      <div className="space-y-4">
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

        <Link
          to="/account/orders"
          className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5 transition active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/60 text-xl text-title-text">
            <AiOutlineShoppingCart />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-extrabold text-title-text">Lịch sử đơn hàng</p>
            <p className="mt-1 text-xs font-semibold text-text-muted">
              Xem trạng thái, sản phẩm và thanh toán của từng đơn.
            </p>
          </div>
          <AiOutlineRight className="shrink-0 text-lg text-text-muted" />
        </Link>

        <AccountWishlistSection
          items={wishlistItems}
          isLoading={isLoadingWishlist}
        />

        <AccountActivityPanel summary={summary} />

        <AccountNotice message="Lịch sử chi tiết đơn hàng, wishlist và địa chỉ mặc định sẽ dùng cùng dữ liệu tài khoản này ở bước tiếp theo." />
      </div>
    </main>
  );
};
