import { useState } from "react";
import { getAccessToken, getPhoneNumber } from "zmp-sdk/apis";
import { supabase } from "services/supabase";

interface ZaloPhoneResponse {
  phoneNumber: string;
}
export const useZaloPhoneNumber = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getPhone = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      const { token: phoneToken } = await getPhoneNumber();

      const { data, error: fnError } = await supabase.functions.invoke<ZaloPhoneResponse>(
        "zalo-phone",
        { body: { accessToken, phoneToken } },
      );

      if (fnError) throw fnError;
      if (!data?.phoneNumber) throw new Error("Không lấy được số điện thoại");

      return data.phoneNumber;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không lấy được số điện thoại"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { getPhone, isLoading, error };
};
