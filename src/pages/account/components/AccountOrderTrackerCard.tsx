import { Link } from "react-router-dom";
import { AiOutlineCheckCircle, AiOutlineClockCircle, AiOutlineRight, AiOutlineShoppingCart } from "react-icons/ai";
import { CustomerAccountSummary } from "types";
import { formatPrice } from "utils";

interface AccountOrderTrackerCardProps {
  summary?: CustomerAccountSummary;
}

export const AccountOrderTrackerCard = ({ summary }: AccountOrderTrackerCardProps) => {
  const pendingOrders = summary?.pending_orders ?? 0;
  const paidOrders = summary?.paid_orders ?? 0;
  const totalDepositAmount = summary?.total_deposit_amount ?? 0;

  return (
    <section className="overflow-hidden rounded-[30px] bg-title-text text-white shadow-[0_16px_34px_rgba(92,64,51,0.2)]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/60">Theo dõi đơn</p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold leading-8">Đơn hàng của bạn</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/72">
              Xem trạng thái cọc, lịch làm và tiến độ giao của từng đơn đã gửi cho Yenni.
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-white/15 text-2xl">
            <AiOutlineShoppingCart />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/12 p-3">
            <AiOutlineClockCircle className="text-xl text-primary" />
            <p className="mt-2 font-heading text-xl font-extrabold leading-none">{pendingOrders}</p>
            <p className="mt-1 text-[10px] font-bold leading-4 text-white/65">đơn đang theo dõi</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-3">
            <AiOutlineCheckCircle className="text-xl text-[#86EFAC]" />
            <p className="mt-2 font-heading text-xl font-extrabold leading-none">{paidOrders}</p>
            <p className="mt-1 text-[10px] font-bold leading-4 text-white/65">đơn đã cọc</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-3">
            <span className="text-lg font-extrabold text-[#FDE68A]">₫</span>
            <p className="mt-2 break-words font-heading text-sm font-extrabold leading-5">{formatPrice(totalDepositAmount)}</p>
            <p className="mt-1 text-[10px] font-bold leading-4 text-white/65">tiền cọc</p>
          </div>
        </div>
      </div>

      <Link
        to="/account/orders"
        className="flex min-h-12 items-center justify-between gap-3 bg-white px-4 text-sm font-extrabold text-title-text transition active:bg-background-main"
      >
        <span>Xem lịch sử đơn hàng</span>
        <AiOutlineRight className="text-lg" />
      </Link>
    </section>
  );
};
