import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserInfo } from "zmp-sdk/apis";
import { AiOutlineDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ConfirmDialog, Emptier, ModalSuccess, Spinner } from "components/ui";
import { EmptyCartIcon } from "components/icons";
import { useZaloPhoneNumber } from "hooks/useZaloPhoneNumber";
import { useCreateOrder, useGetUserPromotions } from "queries";
import { CartCheckoutInput, CartCheckoutSchema } from "schemas";
import { useCartStore, getCartSubtotal } from "stores/cart";
import { calculatePromotionDiscount, formatPrice } from "utils";
import {
  CartPromotionSection,
  CartSection,
  CartSummarySection,
  InformCartForm,
} from "./components";

const REMOVE_ITEM_LOADING_DELAY = 500;

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
  const { getPhone, isLoading: isGettingPhone, error: phoneError } = useZaloPhoneNumber();
  const { mutate: createOrder, isPending, error: orderError } = useCreateOrder();
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

  const handleGetPhone = () => {
    getPhone().then((phoneNumber) => {
      if (phoneNumber) {
        setValue("phone", phoneNumber, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    });
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    setRemoveConfirmItem({ itemId, productName });
  };

  const submitOrder = (values: CartCheckoutInput) => {
    if (!canSubmit) return;

    createOrder(
      {
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
      },
      {
        onSuccess: () => {
          clearCart();
          reset();
          setIsSuccessVisible(true);
        },
      },
    );
  };

  const handleSubmit = (values: CartCheckoutInput) => {
    if (!canSubmit || isPending) return;
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
    <main className="bg-background-main px-5 pb-5 pt-4">
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
        isGettingPhone={isGettingPhone}
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
        selectedPromotion={selectedPromotion}
        promotionUnavailableReason={selectedPromotionPreview.unavailableReason}
        hasInvalidStock={hasInvalidStock}
        orderError={orderError}
      />

      <div className="fixed inset-x-0 bottom-0 z-[998] bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleFormSubmit(handleSubmit)}
          disabled={!canSubmit || isPending}
          className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-primary px-4 text-base font-extrabold text-text-main disabled:bg-text-muted disabled:text-white"
        >
          {isPending ? <Spinner label="Đang đặt hàng..." variant="inline" /> : `Xác nhận đặt hàng`}
        </button>
      </div>

      <ModalSuccess
        visible={isSuccessVisible}
        heading="Đặt hàng thành công!"
        title="Cảm ơn bạn đã đặt hàng. Yenni Crochet sẽ liên hệ xác nhận đơn sớm nhất nhé."
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
        title="Xác nhận đặt hàng?"
        description={`Bạn sẽ đặt ${items.length} sản phẩm với tổng thanh toán ${formatPrice(finalPrice)}.`}
        confirmText="Đặt hàng"
        cancelText="Kiểm tra lại"
        isLoading={isPending}
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
