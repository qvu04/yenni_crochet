import { getAccessToken } from "zmp-sdk/apis";
import { setSupabaseAccessToken, supabase } from "./supabase";

interface ZaloAuthResponse {
  supabaseAccessToken: string;
}

let authPromise: Promise<string> | null = null;

export const authenticateZaloWithSupabase = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && authPromise) return authPromise;

  const nextAuthPromise = (async () => {
    const zaloAccessToken = await getAccessToken();
    if (!zaloAccessToken) throw new Error("Chưa lấy được access token Zalo.");

    const { data, error } = await supabase.functions.invoke<ZaloAuthResponse>("zalo-auth", {
      body: { accessToken: zaloAccessToken },
    });

    if (error) throw new Error(error.message || "Xác thực Zalo thất bại.");
    if (!data?.supabaseAccessToken) throw new Error("Server chưa trả về token xác thực.");

    setSupabaseAccessToken(data.supabaseAccessToken);
    return data.supabaseAccessToken;
  })();

  authPromise = nextAuthPromise.then(
    (token) => {
      authPromise = null;
      return token;
    },
    (error) => {
      authPromise = null;
      throw error;
    },
  );

  return authPromise;
};

export const clearZaloSupabaseAuth = () => {
  authPromise = null;
  setSupabaseAccessToken(null);
};
