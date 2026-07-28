export type CustomRequestBudgetRange =
    | "under_100k"
    | "100k_200k"
    | "200k_500k"
    | "over_500k"
    | "need_consult";
export type StatusCustomRequest = "pending" | "contacted" | "completed" | "cancelled";

// Later, when the custom-order workflow needs quoting and production tracking,
// extend the database check constraint and add:
// | "quoted"
// | "accepted"
// | "in_progress"
export interface CreateCustomRequestInput {
    customer_name: string;
    phone: string;
    description?: string;
    status?: StatusCustomRequest;
    occasion?: string;
    preferred_colors?: string;
    expected_date?: string;
    budget_range?: CustomRequestBudgetRange;
    note?: string;
    quantity: number;
    reference_images?: string[];
    zalo_user_id?: string;
}
