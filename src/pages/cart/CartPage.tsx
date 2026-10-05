import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocation, getUserInfo } from "zmp-sdk/apis";
import { AiOutlineDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfirmDialog, Emptier, Spinner } from "components/ui";
import { EmptyCartIcon } from "components/icons";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useCreateOrder, useGetUserPromotions } from "queries";
import { getZaloLocationFromToken, orderServices } from "services";
import {
  createZaloCheckoutSession,
  isZaloCheckoutCancelledError,
} from "services/zalo-checkout";
import { CartCheckoutInput, CartCheckoutSchema } from "schemas";
import { useCartStore, getCartSubtotal } from "stores/cart";
import { OrderPaymentType } from "types";
import {
  calculateDepositAmount,
  calculatePromotionDiscount,
  DEFAULT_DEPOSIT_RATE,
  DEFAULT_MAX_DEPOSIT_AMOUNT,
  DEFAULT_MIN_DEPOSIT_AMOUNT,
  formatPrice,
  handleAppError,
  showErrorToast,
  showSuccessToast,
} from "utils";
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
const CART_DEFAULT_SHIPPING_FEE = 30000;
const CHECKOUT_CANCELLED_COPY =
  "Chưa nhận được cọc hoặc tiền thanh toán. Đơn chưa được xác nhận, bạn có thể thanh toán lại khi sẵn sàng.";

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
  shippingFee: number;
  payableAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: "pending" | "paid";
  paymentType: Extract<OrderPaymentType, "deposit" | "full">;
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
  const [removeConfirmItem, setRemoveConfirmItem] = useState<{
    itemId: string;
    productName: string;
  } | null>(null);
  const [isRemovingItem, setIsRemovingItem] = useState(false);
  const [submitConfirmValues, setSubmitConfirmValues] =
    useState<CartCheckoutInput | null>(null);
  const [checkoutError, setCheckoutError] = useState<Error | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);
  const [depositSuccess, setDepositSuccess] =
    useState<DepositSuccessState | null>(null);
  const [paymentType, setPaymentType] =
    useState<Extract<OrderPaymentType, "deposit" | "full">>("deposit");
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
  const {
    getPhone,
    getPhoneOnce,
    isLoading: isGettingPhone,
    error: phoneError,
  } = useZaloPhoneNumber();
  const {
    mutateAsync: createOrder,
    isPending,
    error: orderError,
  } = useCreateOrder();
  const { data: claimedUserPromotions, isLoading: isLoadingPromotions } =
    useGetUserPromotions({
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
      .catch(() => {});
  }, [setValue]);

  const subtotal = getCartSubtotal(items);
  const selectedUserPromotion = useMemo(() => {
    return claimedUserPromotions?.find(
      (item) => item.promotion_id === selectedPromotionId,
    );
  }, [claimedUserPromotions, selectedPromotionId]);
  const selectedPromotion = selectedUserPromotion?.promotion;
  const selectedPromotionPreview = selectedPromotion
    ? calculatePromotionDiscount(selectedPromotion, subtotal)
    : { discountAmount: 0, finalPrice: subtotal, unavailableReason: null };
  const canUseSelectedPromotion = Boolean(
    selectedPromotion && !selectedPromotionPreview.unavailableReason,
  );
  const discountAmount = canUseSelectedPromotion
    ? selectedPromotionPreview.discountAmount
    : 0;
  const finalPrice = canUseSelectedPromotion
    ? selectedPromotionPreview.finalPrice
    : subtotal;
  const depositAmount = calculateDepositAmount(
    finalPrice,
    CART_DEPOSIT_RATE,
    CART_MAX_DEPOSIT_AMOUNT,
    CART_MIN_DEPOSIT_AMOUNT,
  );
  const shippingFee = CART_DEFAULT_SHIPPING_FEE;
  const payableAmount = finalPrice + shippingFee;
  const remainingAmount = Math.max(0, finalPrice - depositAmount);
  const checkoutAmount =
    paymentType === "full" ? payableAmount : depositAmount + shippingFee;
  const checkoutRemainingAmount = paymentType === "full" ? 0 : remainingAmount;
  const checkoutActionLabel =
    paymentType === "full" ? "Thanh toán toàn bộ" : "Thanh toán cọc + ship";
  const checkoutSummaryLabel = "Thanh toán hôm nay";
  const hasInvalidStock = items.some(
    (item) => item.stock_quantity <= 0 || item.quantity > item.stock_quantity,
  );
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
        showErrorToast(
          "Chưa lấy được số từ Zalo, bạn nhập thủ công giúp shop nhé.",
        );
      }
    });
  }, [getPhone, setValue]);

  const handleGetLocation = useCallback(async () => {
    if (isGettingLocation) return;

    setIsGettingLocation(true);

    try {
      const location = (await getLocation()) as RawLocationResponse;
      const nextLocation: DeliveryLocation = {
        latitude: toOptionalNumber(location.latitude),
        longitude: toOptionalNumber(location.longitude),
        accuracy: toOptionalNumber(location.accuracy),
        token: location.token,
      };

      if (
        nextLocation.token &&
        (nextLocation.latitude == null || nextLocation.longitude == null)
      ) {
        try {
          const resolvedLocation = await getZaloLocationFromToken(
            nextLocation.token,
          );
          nextLocation.latitude = resolvedLocation.latitude;
          nextLocation.longitude = resolvedLocation.longitude;
          nextLocation.accuracy = toOptionalNumber(resolvedLocation.accuracy);
        } catch {
          showErrorToast(
            "Zalo chưa trả về vị trí, shop sẽ xử lý vị trí này sau.",
          );
        }
      }

      if (
        !nextLocation.token &&
        (nextLocation.latitude == null || nextLocation.longitude == null)
      ) {
        throw new Error("Thiết bị chưa trả về vị trí hợp lệ.");
      }

      setDeliveryLocation(nextLocation);
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Chưa lấy được vị trí hiện tại.");
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
    if (!zaloUserId) {
      showErrorToast(
        "Chưa xác thực được tài khoản Zalo. Bạn thử lại sau giây lát nhé.",
      );
      return;
    }

    let pendingOrderId: string | null = null;
    let checkoutSession: Awaited<
      ReturnType<typeof createZaloCheckoutSession>
    > | null = null;

    setCheckoutError(null);
    setIsCheckingOut(true);

    try {
      pendingOrderId = await createOrder({
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
        payment_type: paymentType,
        deposit_rate: paymentType === "full" ? 1 : CART_DEPOSIT_RATE,
        delivery_latitude: deliveryLocation?.latitude,
        delivery_longitude: deliveryLocation?.longitude,
        delivery_location_accuracy: deliveryLocation?.accuracy,
        delivery_location_token: deliveryLocation?.token,
      });

      if (!pendingOrderId) {
        throw new Error("Không tạo được đơn hàng chờ thanh toán");
      }

      checkoutSession = await createZaloCheckoutSession({
        amount: checkoutAmount,
        desc: "Thanh toan Yenni Crochet",
        item: [{
          id: pendingOrderId,
          name: paymentType === "full" ? "Thanh toan don Yenni Crochet" : "Tien coc Yenni Crochet",
          amount: checkoutAmount,
          quantity: 1,
        }],
        extradata: {
          orderId: pendingOrderId,
          paymentType,
          depositRate: paymentType === "full" ? 1 : CART_DEPOSIT_RATE,
          orderTotal: finalPrice,
          shippingFee,
          payableAmount,
          depositAmount: checkoutAmount,
          remainingAmount: checkoutRemainingAmount,
          customerName: values.customer_name.trim(),
          phone: values.phone.trim(),
          deliveryLocation,
          promotionId: canUseSelectedPromotion ? selectedPromotionId : undefined,
        },
      });

      await orderServices.attachCheckoutOrder({
        orderId: pendingOrderId,
        zaloUserId,
        checkoutOrderId: checkoutSession.checkoutOrder.orderId,
      });

      const transaction = await checkoutSession.paymentResultPromise;
      if (!transaction.transId) {
        throw new Error("Chưa nhận được cọc hoặc tiền thanh toán từ giao dịch này.");
      }

      setDepositSuccess({
        orderId: pendingOrderId,
        itemCount: items.length,
        finalPrice,
        shippingFee,
        payableAmount,
        depositAmount: checkoutAmount,
        remainingAmount: checkoutRemainingAmount,
        paymentStatus: "paid",
        paymentType,
      });
      clearCart();
      reset();
      setDeliveryLocation(null);
      setIsSuccessVisible(true);
      showSuccessToast("Đã nhận thanh toán, đơn đang chờ shop xác nhận.");
    } catch (error) {
      checkoutSession?.cleanup();

      if (isZaloCheckoutCancelledError(error) || pendingOrderId) {
        showErrorToast(
          pendingOrderId
            ? `${CHECKOUT_CANCELLED_COPY} Sản phẩm vẫn được giữ trong giỏ hàng.`
            : "Chưa nhận được cọc hoặc tiền thanh toán. Bạn có thể thử lại khi sẵn sàng.",
          { duration: 6500 },
        );
        return;
      }

      handleAppError(
        error instanceof Error ? error : new Error("Thanh toán thất bại"),
        {
          component: "CartPage",
          action: "submitZaloCheckout",
          fallback: "Thanh toán chưa thành công, bạn thử lại giúp shop nhé.",
        },
      );
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
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#C96F4A] px-4 text-sm font-extrabold text-white"
        >
          Xem sản phẩm
        </Link>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-background-main px-5 pt-4"
      style={{
        paddingBottom: "calc(112px + var(--zaui-safe-area-inset-bottom, 0px))",
      }}
    >
      <header className="mb-4 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#33272A_0%,#33272A_62%,#C96F4A_100%)] text-white shadow-[0_16px_36px_rgba(51,39,42,0.18)]">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/60">
                Giỏ hàng
              </p>
              <h1 className="mt-1 font-heading text-[30px] font-extrabold leading-9">
                Xử lý thanh toán
              </h1>
              <p className="mt-2 max-w-[250px] text-xs font-semibold leading-5 text-white/70">
                Kiểm tra lại sản phẩm, thông tin nhận hàng và khoản thanh toán của bạn.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-3xl bg-white/12 text-center ring-1 ring-white/15">
              <span className="font-heading text-xl font-extrabold leading-none">
                {items.length}
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase text-white/55">
                món
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-white/15 bg-black/10 px-4 py-3">
          {["Sản phẩm", "Giao hàng", "Thanh toán"].map((step, index) => (
            <div key={step} className="flex items-center gap-2 text-[10px] font-bold text-white/75">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-title-text">
                {index + 1}
              </span>
              <span className="hidden min-[390px]:inline">{step}</span>
            </div>
          ))}
        </div>
      </header>

      {/* <div className="mb-4 rounded-3xl border border-primary/70 bg-white/80 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-lg text-[#166534]">
            <AiOutlineCheckCircle />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-text-main">Bạn có thể cọc trước hoặc thanh toán toàn bộ</p>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-text-muted">
              Cọc tối thiểu {formatPrice(CART_MIN_DEPOSIT_AMOUNT)}, tối đa {formatPrice(CART_MAX_DEPOSIT_AMOUNT)}.
            </p>
          </div>
        </div>
      </div> */}

      <CartSection items={items} handleRemoveItem={handleRemoveItem} />

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
        shippingFee={shippingFee}
        payableAmount={payableAmount}
        depositAmount={depositAmount}
        remainingAmount={remainingAmount}
        depositRate={CART_DEPOSIT_RATE}
        minDepositAmount={CART_MIN_DEPOSIT_AMOUNT}
        maxDepositAmount={CART_MAX_DEPOSIT_AMOUNT}
        selectedPromotion={selectedPromotion}
        promotionUnavailableReason={selectedPromotionPreview.unavailableReason}
        hasInvalidStock={hasInvalidStock}
        orderError={checkoutError ?? orderError}
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[998] border-t border-text-main/5 bg-white/95 px-5 pt-3 shadow-[0_-12px_34px_rgba(51,39,42,0.12)] backdrop-blur"
        style={{
          paddingBottom: "calc(16px + var(--zaui-safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-text-muted">
            {checkoutSummaryLabel}
          </span>
          <span className="font-heading text-lg font-extrabold text-title-text">
            {formatPrice(checkoutAmount)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleFormSubmit(handleSubmit)}
          disabled={!canSubmit || isPending || isCheckingOut}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#33272A] px-4 text-base font-extrabold text-white disabled:bg-text-muted disabled:text-white"
        >
          {isPending || isCheckingOut ? (
            <Spinner label="Đang thanh toán..." variant="inline" />
          ) : (
            checkoutActionLabel
          )}
        </button>
      </div>

      <DepositSuccessModal
        visible={isSuccessVisible}
        orderId={depositSuccess?.orderId}
        itemCount={depositSuccess?.itemCount ?? 0}
        finalPrice={depositSuccess?.finalPrice ?? 0}
        shippingFee={depositSuccess?.shippingFee ?? 0}
        payableAmount={depositSuccess?.payableAmount ?? 0}
        depositAmount={depositSuccess?.depositAmount ?? 0}
        remainingAmount={depositSuccess?.remainingAmount ?? 0}
        paymentStatus={depositSuccess?.paymentStatus ?? "paid"}
        paymentType={depositSuccess?.paymentType ?? "deposit"}
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
        iconClassName="bg-[#F5D6C8] text-[#33272A]"
        confirmClassName="!bg-[#C96F4A] !text-white"
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
        title={
          paymentType === "full" ? "Xác nhận thanh toán?" : "Xác nhận đặt cọc?"
        }
        description={
          <span className="space-y-2 text-left">
            <span className="block">
              {paymentType === "full"
                ? `Bạn sẽ thanh toán toàn bộ ${formatPrice(payableAmount)} gồm đơn hàng và phí ship ${formatPrice(shippingFee)} trong màn hình thanh toán của Zalo. Sau khi Zalo xác nhận, đơn sẽ chờ shop xác nhận.`
                : `Bạn sẽ thanh toán ${formatPrice(checkoutAmount)} gồm tiền cọc ${formatPrice(depositAmount)} và phí ship ${formatPrice(shippingFee)} trong màn hình thanh toán của Zalo. Phần còn lại là ${formatPrice(remainingAmount)}.`}
            </span>
            <span className="block rounded-2xl bg-[#F5D6C8] px-3 py-2 text-xs font-bold leading-5 text-[#33272A]">
              Bạn nhớ lưu lại bill/chứng từ thanh toán từ ngân hàng để shop có
              thể hỗ trợ đối soát nhanh nếu cần thiết.
            </span>
          </span>
        }
        confirmText={paymentType === "full" ? "Thanh toán" : "Đặt cọc"}
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
