import { Icon } from "zmp-ui";

interface OrderSuccessProps {
  onClose: () => void;
  onOrderMore: () => void;
}

export const OrderSuccess = ({ onClose, onOrderMore }: OrderSuccessProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
        <Icon icon="zi-check" size={32} className="text-text-main" />
      </div>

      <div>
        <p className="font-heading text-xl font-bold text-text-main">Đặt hàng thành công!</p>
        <p className="mt-1 text-sm text-text-muted">
          Cảm ơn bạn đã đặt hàng — Yenni Crochet sẽ liên hệ đến bạn để xác nhận đơn sớm nhất nhé 🧶
        </p>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2">
        <button
          onClick={onOrderMore}
          className="w-full rounded-2xl bg-primary py-3 text-center text-base font-bold text-text-main"
        >
          Đặt thêm sản phẩm khác
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-2xl border border-background-main py-3 text-center text-base font-bold text-text-main"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
