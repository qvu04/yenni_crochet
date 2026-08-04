import { CustomerAccountSummary, CustomerProfile, UpsertCustomerProfileInput } from "types";
import { supabase } from "./supabase";

const toAccountSummary = (summary: CustomerAccountSummary): CustomerAccountSummary => ({
  ...summary,
  total_orders: Number(summary.total_orders ?? 0),
  pending_orders: Number(summary.pending_orders ?? 0),
  paid_orders: Number(summary.paid_orders ?? 0),
  total_deposit_amount: Number(summary.total_deposit_amount ?? 0),
  total_custom_requests: Number(summary.total_custom_requests ?? 0),
  pending_custom_requests: Number(summary.pending_custom_requests ?? 0),
});

export const accountServices = {
  upsertCustomerProfile: async (input: UpsertCustomerProfileInput): Promise<CustomerProfile> => {
    const { data, error } = await supabase.rpc("upsert_customer_profile", {
      p_zalo_user_id: input.zalo_user_id,
      p_display_name: input.display_name ?? null,
      p_avatar_url: input.avatar_url ?? null,
      p_phone: input.phone ?? null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return (Array.isArray(data) ? data[0] : data) as CustomerProfile;
  },

  getCustomerAccountSummary: async (zaloUserId: string): Promise<CustomerAccountSummary> => {
    const { data, error } = await supabase.rpc("get_customer_account_summary", {
      p_zalo_user_id: zaloUserId,
    });

    if (error) {
      throw new Error(error.message);
    }

    const summary = (Array.isArray(data) ? data[0] : data) as CustomerAccountSummary | null;

    return toAccountSummary(summary ?? {
      zalo_user_id: zaloUserId,
      total_orders: 0,
      pending_orders: 0,
      paid_orders: 0,
      total_deposit_amount: 0,
      total_custom_requests: 0,
      pending_custom_requests: 0,
    });
  },
};
