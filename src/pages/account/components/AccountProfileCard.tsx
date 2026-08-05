import { AiOutlineReload, AiOutlineUser } from "react-icons/ai";
import { Spinner } from "components/ui";
import { CustomerAccountSummary, ZaloCustomerProfile } from "types";

interface AccountProfileCardProps {
  profile?: ZaloCustomerProfile | null;
  summary?: CustomerAccountSummary;
  isLoadingProfile?: boolean;
  isGettingPhone?: boolean;
  isSyncing?: boolean;
  onGetPhone: () => void;
  onRefresh: () => void;
}

export const AccountProfileCard = ({
  profile,
  summary,
  isLoadingProfile,
  isGettingPhone,
  isSyncing,
  onGetPhone,
  onRefresh,
}: AccountProfileCardProps) => {
  const displayName = summary?.display_name ?? profile?.display_name ?? "Bạn của Yenni";
  const avatarUrl = summary?.avatar_url ?? profile?.avatar_url;
  const phone = summary?.phone;
  const phoneLabel = phone
    ?? (isGettingPhone ? "Đang xin quyền số điện thoại..." : "Chưa cấp quyền số điện thoại");

  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_14px_34px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5">
      <div className="h-2 bg-primary" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-primary/60 text-3xl text-title-text shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <AiOutlineUser />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-text-muted">Tài khoản Zalo</p>
            <h1 className="mt-1 truncate font-heading text-[26px] font-extrabold leading-8 text-title-text">
              {isLoadingProfile ? "Đang tải..." : displayName}
            </h1>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoadingProfile || isSyncing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-main text-lg text-title-text disabled:text-text-muted"
            aria-label="Làm mới tài khoản"
          >
            <AiOutlineReload />
          </button>
        </div>

        <div className="mt-4 rounded-3xl bg-background-main p-3">
          <p className="text-xs font-bold text-text-muted">Số điện thoại</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-text-main">
              {phoneLabel}
            </p>
            {!phone && (
              <button
                type="button"
                onClick={onGetPhone}
                disabled={isGettingPhone}
                className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-title-text shadow-sm disabled:text-text-muted"
              >
                {isGettingPhone ? "Đang lấy..." : "Lấy từ Zalo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
