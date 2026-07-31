import { useEffect, useMemo, useState } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { Products } from "types";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import {
  calculatePromotionDiscount,
  formatDiscount,
  formatPrice,
  getMatchedPriceTier,
  getPromotionUnavailableReason,
  getStockLabel,
  resolveUnitPrice,
} from "utils";
import { useCreateOrder, useGetUserPromotions } from "queries";
import { PromotionPickerSkeleton, Spinner } from "components/ui";
import { AiOutlineGift } from "react-icons/ai";

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
  const [zaloUserId, setZaloUserId] = useState<string>();
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>();

  const { mutate: createOrder, isPending, error: orderError } = useCreateOrder();
  const { data: claimedUserPromotions, isLoading: isLoadingPromotions } = useGetUserPromotions({
    zaloUserId,
    status: "claimed",
  });
  const { getPhone, isLoading: isGettingPhone, error: phoneError } = useZaloPhoneNumber();

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => {
        setCustomerName((prev) => prev || userInfo.name);
        if (userInfo.id) {
          setZaloUserId(userInfo.id);
        }
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
  const matchedPriceTier = getMatchedPriceTier({
    priceTiers: product.product_price_tiers,
    quantity,
    variantId: null,
  });
  const unitPrice = resolveUnitPrice({
    basePrice: product.price,
    priceTiers: product.product_price_tiers,
    quantity,
    variantId: null,
  });
  const subtotal = unitPrice * quantity;
  const selectedUserPromotion = useMemo(() => {
    return claimedUserPromotions?.find((item) => item.promotion_id === selectedPromotionId);
  }, [claimedUserPromotions, selectedPromotionId]);
  const selectedPromotion = selectedUserPromotion?.promotion;
  const selectedPromotionPreview = selectedPromotion
    ? calculatePromotionDiscount(selectedPromotion, subtotal)
    : { discountAmount: 0, finalPrice: subtotal, unavailableReason: null };
  const canUseSelectedPromotion = Boolean(selectedPromotion && !selectedPromotionPreview.unavailableReason);
  const finalPrice = canUseSelectedPromotion ? selectedPromotionPreview.finalPrice : subtotal;
  const discountAmount = canUseSelectedPromotion ? selectedPromotionPreview.discountAmount : 0;

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
        zalo_user_id: zaloUserId,
        promotion_id: canUseSelectedPromotion ? selectedPromotionId : undefined,
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
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-text-main">{formatPrice(unitPrice)}/cái</p>
              {matchedPriceTier && (
                <span className="rounded-full bg-primary/60 px-2 py-0.5 text-[10px] font-extrabold text-title-text">
                  Giá sỉ
                </span>
              )}
            </div>
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
          <p className="mt-2 text-xs font-semibold text-text-muted">
            {getStockLabel(product.stock_quantity)}
          </p>
          {matchedPriceTier && (
            <p className="mt-2 rounded-2xl bg-primary/50 px-3 py-2 text-xs font-bold leading-5 text-title-text">
              Đã áp dụng giá sỉ từ {matchedPriceTier.min_quantity}
              {matchedPriceTier.max_quantity ? `-${matchedPriceTier.max_quantity}` : "+"} sản phẩm:
              {" "}{formatPrice(matchedPriceTier.unit_price)}/cái
            </p>
          )}
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

        <div className="rounded-2xl bg-background-main p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-lg text-title-text">
                <AiOutlineGift />
              </span>
              <div>
                <p className="text-sm font-bold text-text-main">Ưu đãi của bạn</p>
                <p className="text-xs font-semibold text-text-muted">
                  {isLoadingPromotions ? "Đang tải voucher" : "Chọn 1 voucher đã đổi"}
                </p>
              </div>
            </div>
            {selectedPromotionId && (
              <button
                type="button"
                onClick={() => setSelectedPromotionId(undefined)}
                className="text-xs font-bold text-title-text"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          {!zaloUserId && (
            <p className="rounded-2xl bg-white p-3 text-xs font-semibold leading-5 text-text-muted">
              Chưa lấy được thông tin Zalo nên chưa thể tải voucher của bạn.
            </p>
          )}

          {zaloUserId && isLoadingPromotions && (
            <PromotionPickerSkeleton itemClassName="bg-white" />
          )}

          {zaloUserId && !isLoadingPromotions && (!claimedUserPromotions || claimedUserPromotions.length === 0) && (
            <p className="rounded-2xl bg-white p-3 text-xs font-semibold leading-5 text-text-muted">
              Bạn chưa có voucher đã đổi. Vào tab Ưu đãi để đổi voucher nhé.
            </p>
          )}

          {claimedUserPromotions && claimedUserPromotions.length > 0 && (
            <div className="space-y-2">
              {claimedUserPromotions.map((userPromotion) => {
                if (!userPromotion.promotion) return null;

                const isSelected = selectedPromotionId === userPromotion.promotion_id;
                const unavailableReason = getPromotionUnavailableReason(userPromotion.promotion, subtotal);

                return (
                  <button
                    key={userPromotion.id}
                    type="button"
                    onClick={() => setSelectedPromotionId(isSelected ? undefined : userPromotion.promotion_id)}
                    className={`w-full rounded-2xl p-3 text-left transition ${isSelected
                      ? "bg-primary text-text-main ring-2 ring-title-text/10"
                      : "bg-white text-text-main ring-1 ring-text-main/5"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-extrabold">{userPromotion.promotion.code}</p>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-text-muted">
                          {userPromotion.promotion.title}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-title-text shadow-sm">
                        {formatDiscount(userPromotion.promotion)}
                      </span>
                    </div>
                    {unavailableReason && (
                      <p className="mt-2 text-xs font-semibold text-[#B91C1C]">{unavailableReason}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl bg-background-main p-4 text-sm">
          <div className="flex items-center justify-between gap-3 text-text-muted">
            <span>Tạm tính</span>
            <span className="font-bold text-text-main">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-text-muted">
            <span>Giảm giá</span>
            <span className="font-bold text-[#B91C1C]">-{formatPrice(discountAmount)}</span>
          </div>
          <div className="border-t border-text-main/10 pt-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-text-main">Tổng thanh toán</span>
              <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(finalPrice)}</span>
            </div>
          </div>
          {selectedPromotionPreview.unavailableReason && selectedPromotion && (
            <p className="pt-1 text-xs font-semibold text-[#B91C1C]">
              {selectedPromotionPreview.unavailableReason}
            </p>
          )}
        </div>

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
          {isPending ? <Spinner label="Đang đặt hàng..." variant="inline" /> : "Xác nhận đặt hàng"}
        </button>
      </div>
    </div>
  );
};
