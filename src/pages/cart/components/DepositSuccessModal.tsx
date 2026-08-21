import { Button, Modal, Space } from "antd-mobile";
import { AiOutlineCheckCircle, AiOutlineMessage, AiOutlineShoppingCart } from "react-icons/ai";
import { formatPrice } from "utils";
import { SummaryCell } from "./SummaryCell";

interface DepositSuccessModalProps {
  visible: boolean;
  orderId?: string | null;
  itemCount: number;
  finalPrice: number;
  shippingFee: number;
  payableAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: "pending" | "paid";
  paymentType: "deposit" | "full";
  onViewOrder: () => void;
  onContactShop: () => void;
  onContinueShopping: () => void;
  onClose: () => void;
}

const getShortOrderId = (orderId?: string | null) => {
  return orderId ? orderId.slice(0, 8).toUpperCase() : "Đang cập nhật";
};

export const DepositSuccessModal = ({
  visible,
  orderId,
  itemCount,
  finalPrice,
  shippingFee,
  payableAmount,
  depositAmount,
  remainingAmount,
  paymentStatus,
  paymentType = "full",
  onViewOrder,
  onContactShop,
  onContinueShopping,
  onClose,
}: DepositSuccessModalProps) => {
  const isPaid = paymentStatus === "paid";
  const isFullPayment = paymentType === "full";
  const paidLabel = isFullPayment ? "Thanh toán thành công" : "Đặt cọc thành công";
  const paidAmountLabel = isFullPayment ? "Đã thanh toán" : "Đã thanh toán hôm nay";

  return (
    <Modal
      visible={visible}
      className="yenni-deposit-success-modal"
      getContainer={() => document.body}
      bodyClassName="yenni-confirm-dialog-body"
      bodyStyle={{
        maxHeight: "calc(100dvh - var(--zaui-safe-area-inset-top, 0px) - var(--zaui-safe-area-inset-bottom, 0px) - 48px)",
        overflowY: "auto",
      }}
      closeOnMaskClick={false}
      showCloseButton
      onClose={onClose}
      content={
        <div className="px-1 py-2">
          <div className="rounded-[28px] bg-[linear-gradient(135deg,#ECFDF5_0%,#FFF7ED_55%,#FFE4E6_100%)] p-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-white text-4xl text-[#16A34A] shadow-sm">
              <AiOutlineCheckCircle />
            </div>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-text-muted">
              {isPaid ? paidLabel : "Đang kiểm tra giao dịch"}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-extrabold leading-8 text-title-text">
              {isPaid ? "Shop đã nhận đơn của bạn" : "Shop đã ghi nhận đơn của bạn"}
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-text-muted">
              {isPaid
                ? isFullPayment
                  ? "Yenni Crochet đã ghi nhận thanh toán toàn bộ và sẽ liên hệ xác nhận sớm nhất nhé."
                  : "Yenni Crochet sẽ kiểm tra lịch làm và liên hệ xác nhận sớm nhất nhé."
                : "Zalo đang xác nhận kết quả chuyển khoản. Khi giao dịch hoàn tất, đơn sẽ tự chuyển sang trạng thái chờ shop xác nhận."}
            </p>
          </div>

          <div className="mt-4 rounded-3xl bg-background-main p-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className="min-w-0">
                <p className="text-xs font-bold text-text-muted">Mã đơn hàng</p>
                <p className="mt-1 font-heading text-lg font-extrabold text-title-text">
                  #{getShortOrderId(orderId)}
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-xl text-title-text">
                <AiOutlineShoppingCart />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <SummaryCell label="Số món" value={`${itemCount} món`} />
              <SummaryCell label="Sản phẩm" value={formatPrice(finalPrice)} />
              <SummaryCell label="Phí ship" value={formatPrice(shippingFee)} />
              <SummaryCell label="Tổng thanh toán" value={formatPrice(payableAmount)} />
              <SummaryCell label={isPaid ? paidAmountLabel : "Đang xác nhận"} value={isPaid ? formatPrice(depositAmount) : "Chờ Zalo"} strong />
              <SummaryCell label="Còn lại" value={formatPrice(remainingAmount)} />
            </div>

            <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-bold leading-5 text-text-muted shadow-sm">
              Bạn giữ lại bill/chứng từ thanh toán để shop hỗ trợ đối soát nếu giao dịch cần kiểm tra lại.
            </p>
          </div>

          <Space direction="vertical" block className="mt-5">
            <Button
              block
              onClick={onViewOrder}
              disabled={!orderId}
              className="!rounded-2xl !border-none !bg-primary !py-3 !text-base !font-bold !text-text-main disabled:!bg-text-muted disabled:!text-white"
            >
              Xem đơn hàng
            </Button>
            <Button
              block
              fill="outline"
              onClick={onContactShop}
              className="!rounded-2xl !border-title-text/15 !py-3 !text-base !font-bold !text-title-text"
            >
              <span className="inline-flex items-center justify-center gap-2">
                Tiếp tục mua hàng
              </span>
            </Button>
            {/* <Button
              block
              fill="none"
              onClick={onContinueShopping}
              className="!rounded-2xl !py-2.5 !text-sm !font-bold !text-text-muted"
            >
              Tiếp tục mua hàng
            </Button> */}
          </Space>
        </div>
      }
    />
  );
};
