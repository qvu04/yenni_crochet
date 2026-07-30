import z from "zod";

export const CartCheckoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Vui lòng nhập tên người nhận!"),
  phone: z
    .string()
    .trim()
    .regex(/^(0[0-9]{9}|\+84[0-9]{9})$/, "Số điện thoại chưa hợp lệ!"),
  address: z.string().trim().min(8, "Vui lòng nhập địa chỉ giao hàng đầy đủ hơn!"),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform((value) => value || undefined)
    .optional(),
});

export type CartCheckoutInput = z.infer<typeof CartCheckoutSchema>;
