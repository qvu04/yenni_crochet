import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLocation, getUserInfo } from "zmp-sdk/apis";
import { AiOutlineDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfirmDialog, Emptier, ModalSuccess, Spinner } from "components/ui";
import { EmptyCartIcon } from "components/icons";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useCreateOrder, useGetUserPromotions } from "queries";
import { createZaloCheckoutOrder } from "services/zalo-checkout";
import { getZaloLocationFromToken } from "services";
import { CartCheckoutInput, CartCheckoutSchema } from "schemas";
import { useCartStore, getCartSubtotal } from "stores/cart";
import { calculateDepositAmount, calculatePromotionDiscount, formatPrice, showErrorToast } from "utils";
import {
  CartPromotionSection,
  CartSection,
  CartSummarySection,
  InformCartForm,
} from "./components";

const REMOVE_ITEM_LOADING_DELAY = 500;
const CART_DEPOSIT_RATE = 0.3;
const ALLOW_UNPAID_ORDER_FOR_TESTING = true;

const PAID_ORDER_SUCCESS_COPY = {
  heading: "Đặt cọc thành công!",
  title: "Cảm ơn bạn đã đặt cọc. Yenni Crochet sẽ liên hệ xác nhận đơn và phần còn lại sớm nhất nhé.",
};

const TEST_ORDER_SUCCESS_COPY = {
  heading: "Đã tạo đơn thử nghiệm!",
  title: "Đơn đã được ghi nhận nhưng chưa thanh toán tiền cọc. Yenni Crochet sẽ dùng đơn này để kiểm tra quy trình.",
};

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
  const [successCopy, setSuccessCopy] = useState(PAID_ORDER_SUCCESS_COPY);
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
  const depositAmount = calculateDepositAmount(finalPrice, CART_DEPOSIT_RATE);
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
      showErrorToast(error.message);
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
      let paymentStatus: "pending" | "paid" = "paid";
      let paidDepositAmount = checkoutAmount;
      let orderRemainingAmount = remainingAmount;

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
          hasCompletedCheckout = true;
        } catch (checkoutErr) {
          if (!ALLOW_UNPAID_ORDER_FOR_TESTING) {
            throw checkoutErr;
          }

          paymentStatus = "pending";
          paidDepositAmount = 0;
          orderRemainingAmount = finalPrice;
          showErrorToast("Đang bật chế độ test: đơn vẫn được tạo dù chưa thanh toán cọc.");
        }
      }

      await createOrder({
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
        payment_status: paymentStatus,
        deposit_rate: CART_DEPOSIT_RATE,
        deposit_amount: paidDepositAmount,
        remaining_amount: orderRemainingAmount,
        checkout_order_id: checkoutOrderId,
        checkout_transaction_id: checkoutTransactionId,
        checkout_message_token: checkoutMessageToken,
        delivery_latitude: deliveryLocation?.latitude,
        delivery_longitude: deliveryLocation?.longitude,
        delivery_location_accuracy: deliveryLocation?.accuracy,
        delivery_location_token: deliveryLocation?.token,
      });

      clearCart();
      reset();
      setDeliveryLocation(null);
      setSuccessCopy(paymentStatus === "paid" ? PAID_ORDER_SUCCESS_COPY : TEST_ORDER_SUCCESS_COPY);
      setIsSuccessVisible(true);
    } catch (err) {
      const paymentError = err instanceof Error ? err : new Error("Thanh toán thất bại");

      if (hasCompletedCheckout) {
        setCheckoutError(new Error(`Đã nhận tiền cọc nhưng tạo đơn thất bại: ${paymentError.message}`));
      } else {
        showErrorToast(paymentError.message);
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
    <main className="bg-background-main px-5 pb-3 pt-4">
      <header className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Giỏ hàng</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-title-text">Đơn hàng của bạn</h1>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          Kiểm tra sản phẩm, chọn voucher và điền thông tin nhận hàng giúp shop bạn nhé.
        </p>
      </header>
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
        selectedPromotion={selectedPromotion}
        promotionUnavailableReason={selectedPromotionPreview.unavailableReason}
        hasInvalidStock={hasInvalidStock}
        orderError={checkoutError ?? orderError}
      />

      <div className="fixed inset-x-0 bottom-0 z-[998] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleFormSubmit(handleSubmit)}
          disabled={!canSubmit || isPending || isCheckingOut}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-base font-extrabold text-text-main disabled:bg-text-muted disabled:text-white"
        >
          {isPending || isCheckingOut ? <Spinner label="Đang đặt cọc..." variant="inline" /> : `Xác nhận đặt cọc`}
        </button>
      </div>

      <ModalSuccess
        visible={isSuccessVisible}
        heading={successCopy.heading}
        title={successCopy.title}
        onClose={() => setIsSuccessVisible(false)}
        primaryAction={{
          label: "Tiếp tục mua hàng",
          onClick: () => {
            setIsSuccessVisible(false);
            navigate("/");
          },
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
        description={`Bạn sẽ cọc ${formatPrice(depositAmount)} cho đơn ${items.length} sản phẩm. Phần còn lại là ${formatPrice(remainingAmount)}.`}
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
