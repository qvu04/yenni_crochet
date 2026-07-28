import z from "zod";

const optionalText = z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional();

export const StatusCustomRequestEnum = z.enum([
    "pending",
    "contacted",
    "completed",
    "cancelled"
]);

// Later statuses for the full custom-order workflow:
// "quoted", "accepted", "in_progress".
// Add them only after updating the custom_requests.status DB constraint.
export const BudgetRangeCustomRequestEnum = z.enum([
    "under_100k",
    "100k_200k",
    "200k_500k",
    "over_500k",
    "need_consult"
]);
export const CustomRequestInputSchema = z.object({
    customer_name: z.string().trim().min(2, "Vui lòng nhập tên người gửi yêu cầu!"),
    phone: z.string().trim().regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại chưa hợp lệ!"),
    description: optionalText,
    reference_images: z.array(z.string().url()).max(3, "Tối đa 3 ảnh tham khảo").optional(),
    quantity: z
        .number({ message: "Vui lòng nhập số lượng!" })
        .int("Số lượng phải là số nguyên!")
        .min(1, "Số lượng tối thiểu có thể đặt là 1")
        .max(200, "Số lượng có thể đặt tối đa là 200"),
    zalo_user_id: optionalText,
    status: StatusCustomRequestEnum.optional(),
    occasion: optionalText,
    preferred_colors: optionalText,
    expected_date: optionalText,
    budget_range: BudgetRangeCustomRequestEnum.optional(),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").transform((value) => value || undefined).optional(),
});
export type CustomRequestInput = z.infer<typeof CustomRequestInputSchema>;
export type StatusCustomRequest = z.infer<typeof StatusCustomRequestEnum>;
export type BudgetRangeCustomRequest = z.infer<typeof BudgetRangeCustomRequestEnum>;
