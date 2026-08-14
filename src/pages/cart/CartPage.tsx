import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocation, getUserInfo } from "zmp-sdk/apis";
import { AiOutlineCheckCircle, AiOutlineDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfirmDialog, Emptier, Spinner } from "components/ui";
import { EmptyCartIcon } from "components/icons";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useCreateOrder, useGetUserPromotions } from "queries";
import { createZaloCheckoutOrder, isZaloCheckoutCancelledError } from "services/zalo-checkout";
import { getZaloLocationFromToken } from "services";
import { CartCheckoutInput, CartCheckoutSchema } from "schemas";
import { useCartStore, getCartSubtotal } from "stores/cart";
import { calculateDepositAmount, calculatePromotionDiscount, DEFAULT_DEPOSIT_RATE, DEFAULT_MAX_DEPOSIT_AMOUNT, DEFAULT_MIN_DEPOSIT_AMOUNT, formatPrice, handleAppError, showErrorToast, showSuccessToast } from "utils";
import {
  CartPromotionSection,
  CartSection,
  CartSummarySection,
  DepositSuccessModal,
  InformCartForm,
} from "./components";

const REMOVE_ITEM_LOADING_DELAY = 500;
const CART_DEPOSIT_RATE = DEFAULT_DEPOSIT_RATE;
const CART_MIN_DEPOSIT_AMOUNT = DEFAULT_MIN_DEPOSIT_AMOUNT;
const CART_MAX_DEPOSIT_AMOUNT = DEFAULT_MAX_DEPOSIT_AMOUNT;
const CHECKOUT_CANCELLED_COPY = "Bạn vừa hủy đặt cọc, hiện tại shop sẽ chưa tiến hành xác nhận đơn hàng.";

interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  token?: string;
}

interface RawLocationResponse {
  latitude?: string | number;
  longitude?: string | number;
  accuracy?: string | number;
  token?: string;
}

interface DepositSuccessState {
  orderId: string | null;
  itemCount: number;
  finalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: "pending" | "paid";
}

const toOptionalNumber = (value: unknown) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

export const CartPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [zaloUserId, setZaloUserId] = useState<string>();
  const [selectedPromotionId, setSelectedPromotionId] = useState<string>();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [removeConfirmItem, setRemoveConfirmItem] = useState<{ itemId: string; productName: string } | null>(null);
  const [isRemovingItem, setIsRemovingItem] = useState(false);
  const [submitConfirmValues, setSubmitConfirmValues] = useState<CartCheckoutInput | null>(null);
  const [checkoutError, setCheckoutError] = useState<Error | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [depositSuccess, setDepositSuccess] = useState<DepositSuccessState | null>(null);
  const removeItemTimeoutRef = useRef<number>();
  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CartCheckoutInput>({
    resolver: zodResolver(CartCheckoutSchema),
    mode: "onChange",
    defaultValues: {
      customer_name: "",
      phone: "",
      address: "",
      note: "",
    },
  });
  const { getPhone, getPhoneOnce, isLoading: isGettingPhone, error: phoneError } = useZaloPhoneNumber();
  const { mutateAsync: createOrder, isPending, error: orderError } = useCreateOrder();
  const { data: claimedUserPromotions, isLoading: isLoadingPromotions } = useGetUserPromotions({
    zaloUserId,
    status: "claimed",
  });

  useEffect(() => {
    getUserInfo({ autoRequestPermission: true })
      .then(({ userInfo }) => {
        if (userInfo.name) {
          setValue("customer_name", userInfo.name, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }
        if (userInfo.id) {
          setZaloUserId(userInfo.id);
        }
      })
      .catch(() => { });
  }, [setValue]);

  const subtotal = getCartSubtotal(items);
  const selectedUserPromotion = useMemo(() => {
    return claimedUserPromotions?.find((item) => item.promotion_id === selectedPromotionId);
  }, [claimedUserPromotions, selectedPromotionId]);
  const selectedPromotion = selectedUserPromotion?.promotion;
  const selectedPromotionPreview = selectedPromotion
    ? calculatePromotionDiscount(selectedPromotion, subtotal)
    : { discountAmount: 0, finalPrice: subtotal, unavailableReason: null };
  const canUseSelectedPromotion = Boolean(selectedPromotion && !selectedPromotionPreview.unavailableReason);
  const discountAmount = canUseSelectedPromotion ? selectedPromotionPreview.discountAmount : 0;
  const finalPrice = canUseSelectedPromotion ? selectedPromotionPreview.finalPrice : subtotal;
  const depositAmount = calculateDepositAmount(finalPrice, CART_DEPOSIT_RATE, CART_MAX_DEPOSIT_AMOUNT, CART_MIN_DEPOSIT_AMOUNT);
  const remainingAmount = Math.max(0, finalPrice - depositAmount);
  const hasInvalidStock = items.some((item) => item.stock_quantity <= 0 || item.quantity > item.stock_quantity);
  const canSubmit = Boolean(items.length && !hasInvalidStock);

  useEffect(() => {
    return () => {
      if (removeItemTimeoutRef.current) {
        window.clearTimeout(removeItemTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedPromotionPreview.unavailableReason) {
      setSelectedPromotionId(undefined);
    }
  }, [selectedPromotionPreview.unavailableReason]);

  const handleGetPhone = useCallback(() => {
    getPhone().then((phoneNumber) => {
      if (phoneNumber) {
        setValue("phone", phoneNumber, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        showErrorToast("Chưa lấy được số từ Zalo, bạn nhập thủ công giúp shop nhé.");
      }
    });
  }, [getPhone, setValue]);

  const handleGetLocation = useCallback(async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);

    try {
      const location = await getLocation() as RawLocationResponse;
      const nextLocation: DeliveryLocation = {
        latitude: toOptionalNumber(location.latitude),
        longitude: toOptionalNumber(location.longitude),
        accuracy: toOptionalNumber(location.accuracy),
        token: location.token,
      };

      if (nextLocation.token && (nextLocation.latitude == null || nextLocation.longitude == null)) {
        try {
          const resolvedLocation = await getZaloLocationFromToken(nextLocation.token);
          nextLocation.latitude = resolvedLocation.latitude;
          nextLocation.longitude = resolvedLocation.longitude;
          nextLocation.accuracy = toOptionalNumber(resolvedLocation.accuracy);
        } catch {
          showErrorToast("Zalo chưa trả về vị trí, shop sẽ xử lý vị trí này sau.");
        }
      }

      if (!nextLocation.token && (nextLocation.latitude == null || nextLocation.longitude == null)) {
        throw new Error("Thiết bị chưa trả về vị trí hợp lệ.");
      }

      setDeliveryLocation(nextLocation);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Chưa lấy được vị trí hiện tại.");
      handleAppError(error, {
        component: "CartPage",
        action: "getDeliveryLocation",
        fallback: "Chưa lấy được vị trí hiện tại.",
      });
    } finally {
      setIsGettingLocation(false);
    }
  }, [isGettingLocation]);

  useEffect(() => {
    getPhoneOnce().then((phoneNumber) => {
      if (phoneNumber) {
        setValue("phone", phoneNumber, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  }, [getPhoneOnce, setValue]);

  const handleRemoveItem = (itemId: string, productName: string) => {
    setRemoveConfirmItem({ itemId, productName });
  };

  const submitOrder = async (values: CartCheckoutInput) => {
    if (!canSubmit || isPending || isCheckingOut) return;

    const checkoutAmount = depositAmount;
    const merchantTransactionId = `cart-${Date.now()}`;
    let hasCompletedCheckout = false;

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      let checkoutOrderId: string | undefined;
      let checkoutTransactionId: string | undefined;
      let checkoutMessageToken: string | undefined;
      let checkoutPaymentStatus: "pending" | "paid" = "paid";

      if (checkoutAmount > 0) {
        try {
          const checkoutOrder = await createZaloCheckoutOrder({
            amount: checkoutAmount,
            desc: "Thanh toan Yenni Crochet",
            item: [
              {
                id: merchantTransactionId,
                name: "Tien coc Yenni Crochet",
                amount: checkoutAmount,
                quantity: 1,
              },
            ],
            extradata: {
              merchantTransactionId,
              paymentType: "deposit",
              depositRate: CART_DEPOSIT_RATE,
              orderTotal: finalPrice,
              depositAmount: checkoutAmount,
              remainingAmount,
              customerName: values.customer_name.trim(),
              phone: values.phone.trim(),
              deliveryLocation,
              promotionId: canUseSelectedPromotion ? selectedPromotionId : undefined,
              items: items.map((item) => ({
                productId: item.product_id,
                variantId: item.variant_id,
                quantity: item.quantity,
                amount: item.price * item.quantity,
              })),
            },
          });

          checkoutOrderId = checkoutOrder.orderId;
          checkoutTransactionId = checkoutOrder.transId;
          checkoutMessageToken = checkoutOrder.messageToken;
          checkoutPaymentStatus = checkoutOrder.paymentStatus ?? "paid";
          hasCompletedCheckout = checkoutPaymentStatus === "paid";
        } catch (checkoutErr) {
          if (isZaloCheckoutCancelledError(checkoutErr)) {
            showErrorToast(CHECKOUT_CANCELLED_COPY);
            return;
          }
          throw checkoutErr;
        }
      }

      const createdOrderId = await createOrder({
        items: items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          note: item.note?.trim() || undefined,
        })),
        customer_name: values.customer_name.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        note: values.note,
        zalo_user_id: zaloUserId,
        promotion_id: canUseSelectedPromotion ? selectedPromotionId : undefined,
        payment_type: "deposit",
        payment_status: checkoutPaymentStatus,
        deposit_rate: CART_DEPOSIT_RATE,
        deposit_amount: checkoutAmount,
        remaining_amount: remainingAmount,
        checkout_order_id: checkoutOrderId,
        checkout_transaction_id: checkoutTransactionId,
        checkout_message_token: checkoutMessageToken,
        delivery_latitude: deliveryLocation?.latitude,
        delivery_longitude: deliveryLocation?.longitude,
        delivery_location_accuracy: deliveryLocation?.accuracy,
        delivery_location_token: deliveryLocation?.token,
      });

      setDepositSuccess({
        orderId: createdOrderId,
        itemCount: items.length,
        finalPrice,
        depositAmount: checkoutAmount,
        remainingAmount,
        paymentStatus: checkoutPaymentStatus,
      });
      clearCart();
      reset();
      setDeliveryLocation(null);
      setIsSuccessVisible(true);
      showSuccessToast(
        checkoutPaymentStatus === "paid"
          ? "Đặt cọc thành công, đơn đang chờ shop xác nhận."
          : "Shop đã ghi nhận đơn và đang chờ Zalo xác nhận giao dịch.",
      );
    } catch (err) {
      const paymentError = err instanceof Error ? err : new Error("Thanh toán thất bại");

      if (hasCompletedCheckout) {
        setCheckoutError(new Error(`Đã nhận tiền cọc nhưng tạo đơn thất bại: ${paymentError.message}`));
      } else {
        handleAppError(paymentError, {
          component: "CartPage",
          action: "submitDepositCheckout",
          fallback: "Đặt cọc chưa thành công, bạn thử lại giúp shop nhé.",
        });
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSubmit = (values: CartCheckoutInput) => {
    if (!canSubmit || isPending || isCheckingOut) return;
    setSubmitConfirmValues(values);
  };

  if (items.length === 0 && !isSuccessVisible) {
    return (
      <main className="bg-background-main flex items-center justify-center flex-col w-full p-4 pt-8">
        <Emptier
          icon={<EmptyCartIcon />}
          title="Giỏ hàng đang trống"
          compact
          description="Bạn thêm vài món len xinh vào giỏ rồi quay lại đặt hàng nhé."
        />
        <Link
          to="/"
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-extrabold text-text-main"
        >
          Xem sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-background-main px-5 pt-4"
      style={{ paddingBottom: "calc(112px + var(--zaui-safe-area-inset-bottom, 0px))" }}
    >
      <header className="mb-4 overflow-hidden rounded-[30px] bg-title-text text-white shadow-[0_16px_36px_rgba(51,39,42,0.16)]">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/60">Giỏ hàng</p>
              <h1 className="mt-1 font-heading text-[30px] font-extrabold leading-9">Đặt cọc đơn hàng</h1>
            </div>
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-3xl bg-white/12 text-center ring-1 ring-white/15">
              <span className="font-heading text-xl font-extrabold leading-none">{items.length}</span>
              <span className="mt-1 text-[10px] font-bold uppercase text-white/55">món</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 bg-white/5">
          <div className="p-4">
            <p className="text-[11px] font-bold uppercase text-white/50">Cọc hôm nay</p>
            <p className="mt-1 font-heading text-xl font-extrabold">{formatPrice(depositAmount)}</p>
          </div>
          <div className="border-l border-white/10 p-4">
            <p className="text-[11px] font-bold uppercase text-white/50">Còn lại</p>
            <p className="mt-1 font-heading text-xl font-extrabold">{formatPrice(remainingAmount)}</p>
          </div>
        </div>
      </header>

      <div className="mb-4 rounded-3xl border border-primary/70 bg-white/80 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-lg text-[#166534]">
            <AiOutlineCheckCircle />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-text-main">Shop chỉ thu cọc trước</p>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-text-muted">
              Cọc tối thiểu {formatPrice(CART_MIN_DEPOSIT_AMOUNT)}, tối đa {formatPrice(CART_MAX_DEPOSIT_AMOUNT)}.
            </p>
          </div>
        </div>
      </div>

      <CartSection
        items={items}
        handleRemoveItem={handleRemoveItem}
      />

      <InformCartForm
        register={register}
        errors={errors}
        handleGetPhone={handleGetPhone}
        handleGetLocation={handleGetLocation}
        isGettingPhone={isGettingPhone}
        isGettingLocation={isGettingLocation}
        hasDeliveryLocation={Boolean(deliveryLocation)}
        phoneError={phoneError}
      />

      <CartPromotionSection
        zaloUserId={zaloUserId}
        promotions={claimedUserPromotions}
        selectedPromotionId={selectedPromotionId}
        subtotal={subtotal}
        isLoading={isLoadingPromotions}
        onSelectPromotion={setSelectedPromotionId}
      />

      <CartSummarySection
        subtotal={subtotal}
        discountAmount={discountAmount}
        finalPrice={finalPrice}
        depositAmount={depositAmount}
        remainingAmount={remainingAmount}
        depositRate={CART_DEPOSIT_RATE}
        minDepositAmount={CART_MIN_DEPOSIT_AMOUNT}
        maxDepositAmount={CART_MAX_DEPOSIT_AMOUNT}
        selectedPromotion={selectedPromotion}
        promotionUnavailableReason={selectedPromotionPreview.unavailableReason}
        hasInvalidStock={hasInvalidStock}
        orderError={checkoutError ?? orderError}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[998] border-t border-text-main/5 bg-white/95 px-5 pt-3 shadow-[0_-12px_34px_rgba(51,39,42,0.12)] backdrop-blur"
        style={{ paddingBottom: "calc(16px + var(--zaui-safe-area-inset-bottom, 0px))" }}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-text-muted">Số tiền cọc</span>
          <span className="font-heading text-lg font-extrabold text-title-text">{formatPrice(depositAmount)}</span>
        </div>
        <button
          type="button"
          onClick={handleFormSubmit(handleSubmit)}
          disabled={!canSubmit || isPending || isCheckingOut}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-title-text px-4 text-base font-extrabold text-white disabled:bg-text-muted disabled:text-white"
        >
          {isPending || isCheckingOut ? <Spinner label="Đang đặt cọc..." variant="inline" /> : "Xác nhận đặt cọc"}
        </button>
      </div>

      <DepositSuccessModal
        visible={isSuccessVisible}
        orderId={depositSuccess?.orderId}
        itemCount={depositSuccess?.itemCount ?? 0}
        finalPrice={depositSuccess?.finalPrice ?? 0}
        depositAmount={depositSuccess?.depositAmount ?? 0}
        remainingAmount={depositSuccess?.remainingAmount ?? 0}
        paymentStatus={depositSuccess?.paymentStatus ?? "paid"}
        onClose={() => setIsSuccessVisible(false)}
        onViewOrder={() => {
          if (!depositSuccess?.orderId) return;
          setIsSuccessVisible(false);
          navigate(`/account/orders/${depositSuccess.orderId}`);
        }}
        onContactShop={() => {
          setIsSuccessVisible(false);
          navigate("/contact");
        }}
        onContinueShopping={() => {
          setIsSuccessVisible(false);
          navigate("/");
        }}
      />

      <ConfirmDialog
        visible={Boolean(removeConfirmItem)}
        icon={<AiOutlineDelete />}
        iconClassName="bg-[#FEE2E2] text-[#B91C1C]"
        confirmClassName="!bg-[#B91C1C] !text-white"
        title="Xóa sản phẩm?"
        description={
          removeConfirmItem
            ? `Bạn chắc chắn muốn xóa "${removeConfirmItem.productName}" khỏi giỏ hàng chứ?`
            : ""
        }
        confirmText="Xóa"
        cancelText="Giữ lại"
        isLoading={isRemovingItem}
        onCancel={() => setRemoveConfirmItem(null)}
        onConfirm={() => {
          if (!removeConfirmItem || isRemovingItem) return;

          setIsRemovingItem(true);
          removeItemTimeoutRef.current = window.setTimeout(() => {
            removeItem(removeConfirmItem.itemId);
            setRemoveConfirmItem(null);
            setIsRemovingItem(false);
          }, REMOVE_ITEM_LOADING_DELAY);
        }}
      />

      <ConfirmDialog
        visible={Boolean(submitConfirmValues)}
        icon={<AiOutlineShoppingCart />}
        title="Xác nhận đặt cọc?"
        description={`Bạn sẽ cọc ${formatPrice(depositAmount)} cho đơn ${items.length} sản phẩm. Shop áp dụng cọc tối thiểu ${formatPrice(CART_MIN_DEPOSIT_AMOUNT)}, tối đa ${formatPrice(CART_MAX_DEPOSIT_AMOUNT)}; phần còn lại là ${formatPrice(remainingAmount)}.`}
        confirmText="Đặt cọc"
        cancelText="Kiểm tra lại"
        isLoading={isPending || isCheckingOut}
        onCancel={() => setSubmitConfirmValues(null)}
        onConfirm={() => {
          if (submitConfirmValues) {
            submitOrder(submitConfirmValues);
            setSubmitConfirmValues(null);
          }
        }}
      />
    </main>
  );
};
