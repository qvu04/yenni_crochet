import { getAccessToken } from "zmp-sdk/apis";
import { supabase } from "./supabase";

interface ZaloLocationResponse {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

interface FunctionErrorWithContext {
  message?: string;
  context?: Response;
}

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

  return functionError.message || "Không lấy được tọa độ";
};

export const getZaloLocationFromToken = async (locationToken: string) => {
  const accessToken = await getAccessToken();

  const { data, error } = await supabase.functions.invoke<ZaloLocationResponse>(
    "zalo-location",
    { body: { accessToken, locationToken } },
  );

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }

  if (data?.latitude == null || data.longitude == null) {
    throw new Error("Không lấy được tọa độ");
  }

  return data;
};
