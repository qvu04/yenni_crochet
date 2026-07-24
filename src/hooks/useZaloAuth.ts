import { useState } from "react";
import { getAccessToken } from "zmp-sdk/apis";
import { supabase } from "services/supabase";

interface ZaloAuthResponse {
  supabaseAccessToken: string;
}

export const useZaloAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const zaloAccessToken = await getAccessToken();

      const { data, error: fnError } = await supabase.functions.invoke<ZaloAuthResponse>(
        "zalo-auth",
        { body: { accessToken: zaloAccessToken } },
      );

      if (fnError) throw fnError;
      if (!data?.supabaseAccessToken) throw new Error("Xác thực thất bại");
      return data.supabaseAccessToken;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Xác thực thất bại"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
};
