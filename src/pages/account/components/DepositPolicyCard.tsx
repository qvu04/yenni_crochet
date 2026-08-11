import { AiOutlineFileText, AiOutlineSafetyCertificate, AiOutlineWallet } from "react-icons/ai";
import { DEFAULT_DEPOSIT_RATE, DEFAULT_MAX_DEPOSIT_AMOUNT, formatPrice } from "utils";

const policyItems = [
  {
    icon: <AiOutlineWallet />,
    title: "Mức cọc",
    description: `Khách cọc ${Math.round(DEFAULT_DEPOSIT_RATE * 100)}% giá trị đơn, tối đa ${formatPrice(DEFAULT_MAX_DEPOSIT_AMOUNT)}.`,
  },
  {
    icon: <AiOutlineSafetyCertificate />,
    title: "Khi nào shop xử lý",
    description: "Shop chỉ xác nhận và bắt đầu chuẩn bị đơn sau khi giao dịch đặt cọc thành công.",
  },
  {
    icon: <AiOutlineFileText />,
    title: "Phần còn lại",
    description: "Số tiền còn lại khách thanh toán COD hoặc sau khi nhận hàng theo trao đổi với shop.",
  },
];

export const DepositPolicyCard = () => {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-text-main/5">
      <div className="bg-primary/70 px-4 py-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-muted">Chính sách</p>
        <h2 className="mt-1 font-heading text-lg font-extrabold text-title-text">Đặt cọc sản phẩm</h2>
      </div>
      <div className="space-y-3 p-4">
        {policyItems.map((item) => (
          <div key={item.title} className="flex gap-3 rounded-2xl bg-background-main p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg text-title-text shadow-sm">
              {item.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-text-main">{item.title}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">{item.description}</p>
            </div>
          </div>
        ))}
        <p className="rounded-2xl border border-primary/70 bg-primary/20 p-3 text-xs font-bold leading-5 text-title-text">
          Nếu bạn hủy ở màn hình thanh toán, đơn sẽ chưa được đưa vào lịch sử và shop sẽ chưa xác nhận cho đến khi bạn đặt cọc thành công. Nếu có bất kỳ thắc mắc nào, bạn có thể liên hệ riêng với shop nhé.
        </p>
      </div>
    </section>
  );
};
