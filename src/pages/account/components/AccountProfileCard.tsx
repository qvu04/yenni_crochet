import { AiOutlinePhone, AiOutlineReload, AiOutlineUser } from "react-icons/ai";
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
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/60 text-3xl text-title-text">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <AiOutlineUser />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-text-muted">Tài khoản Zalo</p>
          <h1 className="mt-1 truncate font-heading text-2xl font-extrabold text-title-text">
            {isLoadingProfile ? "Đang tải..." : displayName}
          </h1>
          <p className="mt-1 truncate text-xs font-semibold text-text-muted">
            Số điện thoại: {phoneLabel}
          </p>
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
    </section>
  );
};
