import { useCallback, useState } from "react";
import { getAccessToken, getPhoneNumber } from "zmp-sdk/apis";
import { supabase } from "services/supabase";

interface ZaloPhoneResponse {
  phoneNumber: string;
}

interface FunctionErrorWithContext {
  message?: string;
  context?: Response;
}

let phoneNumberRequestPromise: Promise<string | null> | null = null;
let cachedPhoneNumber: string | null = null;

const getFunctionErrorMessage = async (error: unknown) => {
  const functionError = error as FunctionErrorWithContext;

  if (functionError.context instanceof Response) {
    try {
      const detail = await functionError.context.clone().json();
      if (typeof detail?.error === "string") {
        return detail.detail ? `${detail.error}: ${detail.detail}` : detail.error;
      }
    } catch {
    }
  }

  return functionError.message || "Không lấy được số điện thoại";
};

export const useZaloPhoneNumber = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getPhone = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();
      const { token: phoneToken } = await getPhoneNumber();

      const { data, error: fnError } = await supabase.functions.invoke<ZaloPhoneResponse>(
        "zalo-phone",
        { body: { accessToken, phoneToken } },
      );

      if (fnError) {
        throw new Error(await getFunctionErrorMessage(fnError));
      }
      if (!data?.phoneNumber) throw new Error("Không lấy được số điện thoại");

      cachedPhoneNumber = data.phoneNumber;
      return data.phoneNumber;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Không lấy được số điện thoại"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPhoneOnce = useCallback(async (): Promise<string | null> => {
    if (cachedPhoneNumber) return cachedPhoneNumber;

    if (!phoneNumberRequestPromise) {
      phoneNumberRequestPromise = getPhone().then((phoneNumber) => {
        cachedPhoneNumber = phoneNumber;
        return phoneNumber;
      });
    }

    return phoneNumberRequestPromise;
  }, [getPhone]);

  return { getPhone, getPhoneOnce, isLoading, error };
};
