import { FieldErrors, UseFormRegister } from "react-hook-form";
import { CartCheckoutInput } from "schemas";
import { Spinner } from 'components/ui';

interface InformCartFormProps {
  register: UseFormRegister<CartCheckoutInput>;
  errors: FieldErrors<CartCheckoutInput>;
  handleGetPhone: () => void;
  handleGetLocation: () => void;
  isGettingPhone: boolean;
  isGettingLocation: boolean;
  hasDeliveryLocation: boolean;
  phoneError?: Error | null;
}

const fieldClassName =
  "w-full rounded-2xl border border-background-main bg-background-main p-3 text-sm text-text-main outline-none focus:border-primary";
const errorClassName = "mt-1 text-xs text-[#B91C1C]";

export const InformCartForm = ({
  register,
  errors,
  handleGetPhone,
  handleGetLocation,
  isGettingPhone,
  isGettingLocation,
  hasDeliveryLocation,
  phoneError,
}: InformCartFormProps) => {
  return (
    <section className="mb-5 space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <h2 className="font-heading text-xl font-bold text-title-text">Thông tin nhận hàng</h2>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-main">
          Tên người nhận <span className="text-[#B91C1C]">*</span>
        </label>
        <input
          {...register("customer_name")}
          placeholder="Tên người nhận"
          className={fieldClassName}
        />
        {errors.customer_name && (
          <p className={errorClassName}>{errors.customer_name.message}</p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label className="text-sm font-semibold text-text-main">
            Số điện thoại <span className="text-[#B91C1C]">*</span>
          </label>
          <button
            type="button"
            onClick={handleGetPhone}
            disabled={isGettingPhone}
            className="text-xs font-bold text-title-text disabled:text-text-muted"
          >
            {isGettingPhone ? "Đang lấy..." : "Lấy từ Zalo"}
          </button>
        </div>
        <input
          {...register("phone")}
          placeholder={isGettingPhone ? "Đang lấy từ Zalo..." : "09xxxxxxxx"}
          inputMode="tel"
          className={fieldClassName}
        />
        {phoneError && (
          <p className={errorClassName}>
            Lấy số điện thoại từ Zalo thất bại, bạn có thể nhập số điện thoại thủ công hoặc thử lại.
          </p>
        )}
        {errors.phone && (
          <p className={errorClassName}>{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-main">
          Địa chỉ giao hàng <span className="text-[#B91C1C]">*</span>
        </label>
        <textarea
          {...register("address")}
          rows={2}
          placeholder="Địa chỉ giao hàng"
          className={fieldClassName}
        />
        {errors.address && (
          <p className={errorClassName}>{errors.address.message}</p>
        )}
      </div>

      <div className="rounded-2xl bg-background-main p-3">
        <div className="flex flex-col items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-main">Vị trí hỗ trợ giao hàng</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">
              Bạn giúp shop nhập địa chỉ của bạn vẫn là thông tin chính. Nút dùng vị trí này sẽ giúp shop xác định vị trí của bạn chính xác hơn để hỗ trợ giao hàng nhanh hơn.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isGettingLocation}
            className="shrink-0 w-full rounded-full bg-white px-3 py-2 text-xs font-bold text-title-text shadow-sm disabled:text-text-muted"
          >
            {isGettingLocation ? <Spinner label="Đang lấy vị trí..." variant="inline" /> : "Dùng vị trí"}
          </button>
        </div>
        {hasDeliveryLocation && (
          <p className="mt-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-text-main">
            Đã lưu vị trí để shop hỗ trợ giao hàng.
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-main">
          Ghi chú
        </label>
        <textarea
          {...register("note")}
          rows={2}
          placeholder="Ghi chú chung cho đơn hàng nếu có..."
          className={fieldClassName}
        />
        {errors.note && (
          <p className={errorClassName}>{errors.note.message}</p>
        )}
      </div>
    </section>
  );
};
