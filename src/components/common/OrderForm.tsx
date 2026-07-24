import { useEffect, useState } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { Products } from "types";
import { useCreateOrder } from "queries/orders";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { formatPrice } from "utils";

interface OrderFormProps {
  product: Products;
  onCancel: () => void;
  onSuccess: () => void;
}

export const OrderForm = ({ product, onCancel, onSuccess }: OrderFormProps) => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { mutate: createOrder, isPending, error: orderError } = useCreateOrder();
  const { getPhone, isLoading: isGettingPhone, error: phoneError } = useZaloPhoneNumber();

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => {
        setCustomerName((prev) => prev || userInfo.name);
      })
      .catch(() => { });
  }, []);

  const handleGetPhone = () => {
    getPhone().then((phoneNumber) => {
      if (phoneNumber) {
        setPhone(phoneNumber);
      }
    });
  };

  const canSubmit = Boolean(customerName.trim() && phone.trim() && address.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    createOrder(
      {
        product_id: product.id,
        quantity,
        customer_name: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
      },
      { onSuccess },
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-background-main p-3">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-14 w-14 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 font-heading text-sm font-semibold text-text-main">
              {product.name}
            </p>
            <p className="text-sm font-bold text-text-main">{formatPrice(product.price)}</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-main">Số lượng</label>
          <div className="flex w-fit items-center gap-3 rounded-full bg-background-main px-3 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg font-bold text-text-main shadow-sm"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-semibold text-text-main">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-lg font-bold text-text-main shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-main">Tên người nhận</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full rounded-2xl border border-background-main bg-white p-3 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-3">
            <label className="block text-sm font-semibold text-text-main">Số điện thoại</label>
            <button
              type="button"
              onClick={handleGetPhone}
              disabled={isGettingPhone}
              className="text-xs font-semibold text-title-text disabled:text-text-muted"
            >
              {isGettingPhone ? "Đang lấy..." : "Lấy từ Zalo"}
            </button>
          </div>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={isGettingPhone ? "Đang lấy từ Zalo..." : "09xxxxxxxx"}
            inputMode="tel"
            className="w-full rounded-2xl border border-background-main bg-white p-3 text-sm text-text-main outline-none focus:border-primary"
          />
          {phoneError && (
            <p className="mt-1 text-xs text-[#B91C1C]">
              Chưa thể tự lấy SĐT từ Zalo, bạn vui lòng nhập tay nhé.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-main">Địa chỉ giao hàng</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            placeholder="Số nhà, đường, phường/xã, quận/huyện..."
            className="w-full rounded-2xl border border-background-main bg-white p-3 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>

        {product.allow_customization && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-main">
              Ghi chú tùy chỉnh (màu, tên thêu, yêu cầu riêng...)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ví dụ: màu hồng pastel, thêu tên Lan"
              className="w-full rounded-2xl border border-background-main bg-white p-3 text-sm text-text-main outline-none focus:border-primary"
            />
          </div>
        )}

        {orderError && (
          <p className="rounded-2xl bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
            Đặt hàng thất bại, thử lại nhé: {orderError.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t border-background-main bg-white p-4">
        <button
          onClick={onCancel}
          className="rounded-2xl border border-background-main px-5 py-3 text-sm font-bold text-text-main"
        >
          Quay lại
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className="flex-1 rounded-2xl bg-primary py-3 text-center text-base font-bold text-text-main disabled:bg-text-muted disabled:text-white"
        >
          {isPending ? "Đang gửi..." : "Xác nhận đặt hàng"}
        </button>
      </div>
    </div>
  );
};
