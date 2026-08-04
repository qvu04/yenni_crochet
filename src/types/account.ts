export interface CustomerProfile {
  id?: string;
  zalo_user_id: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
}

export interface UpsertCustomerProfileInput {
  zalo_user_id: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface CustomerAccountSummary {
  profile_id?: string;
  zalo_user_id: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  total_deposit_amount: number;
  latest_order_at?: string;
  total_custom_requests: number;
  pending_custom_requests: number;
  latest_custom_request_at?: string;
}

export interface ZaloCustomerProfile {
  zalo_user_id: string;
  display_name?: string;
  avatar_url?: string;
}
