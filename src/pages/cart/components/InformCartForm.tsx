import { FieldErrors, UseFormRegister } from "react-hook-form";
import { AiOutlineEnvironment, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
import { CartCheckoutInput } from "schemas";

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
  "w-full rounded-2xl border border-text-main/5 bg-background-main/70 p-3 text-sm font-semibold text-text-main outline-none transition focus:border-primary focus:bg-white";
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
    <section className="mb-4 rounded-[28px] bg-white p-4 shadow-sm ring-1 ring-text-main/5">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF6FF] text-lg text-[#075985]">
          <AiOutlineEnvironment />
        </span>
        <div>
          <h2 className="font-heading text-lg font-extrabold text-title-text">Thông tin nhận hàng</h2>
          <p className="text-xs font-semibold text-text-muted">Shop dùng thông tin này để xác nhận đơn</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-text-main">
            Tên người nhận <span className="text-[#B91C1C]">*</span>
          </label>
          <div className="relative">
            <AiOutlineUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-text-muted" />
            <input
              {...register("customer_name")}
              placeholder="Tên người nhận"
              className={`${fieldClassName} pl-10`}
            />
          </div>
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
          <div className="relative">
            <AiOutlinePhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-text-muted" />
            <input
              {...register("phone")}
              placeholder={isGettingPhone ? "Đang lấy từ Zalo..." : "09xxxxxxxx"}
              inputMode="tel"
              className={`${fieldClassName} pl-10`}
            />
          </div>
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

        <div className="rounded-3xl border border-[#BAE6FD] bg-[#EFF6FF] p-3">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-main">Vị trí hỗ trợ giao hàng</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">Bạn giúp shop nhập địa chỉ của bạn vẫn là thông tin chính. Nút dùng vị trí này sẽ giúp shop xác định vị trí của bạn chính xác hơn để hỗ trợ giao hàng nhanh hơn.</p>
            </div>
          </div>
          {hasDeliveryLocation ? (
            <p className="mt-2 rounded-2xl bg-white px-3 py-2 text-center text-xs font-bold text-[#075985] shadow-sm">
              Đã lưu vị trí để shop hỗ trợ giao hàng.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="w-full shrink-0 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-[#075985] shadow-sm disabled:text-text-muted"
            >
              {isGettingLocation ? "Đang lấy vị trí..." : "Dùng vị trí"}
            </button>
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
      </div>
    </section>
  );
};
