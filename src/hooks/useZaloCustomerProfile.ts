import { useCallback, useEffect, useState } from "react";
import { getZaloSession } from "services/zalo-session";
import { ZaloCustomerProfile } from "types";

export const useZaloCustomerProfile = () => {
  const [profile, setProfile] = useState<ZaloCustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async ({ forceRefresh = false } = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await getZaloSession({ forceRefresh });
      const normalizedProfile = session?.profile ?? null;

      if (!normalizedProfile) {
        throw new Error("Chưa lấy được thông tin Zalo của bạn.");
      }

      setProfile(normalizedProfile);
      return normalizedProfile;
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Chưa lấy được thông tin Zalo.");
      setError(nextError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    isLoading,
    error,
    refreshProfile: () => loadProfile({ forceRefresh: true }),
  };
};
