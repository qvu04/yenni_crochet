import { useCallback, useEffect, useState } from "react";
import { getUserInfo } from "zmp-sdk/apis";
import { ZaloCustomerProfile } from "types";

interface ZaloUserInfo {
  id?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
}

const normalizeZaloUserInfo = (userInfo: ZaloUserInfo): ZaloCustomerProfile | null => {
  if (!userInfo.id) return null;

  return {
    zalo_user_id: userInfo.id,
    display_name: userInfo.name,
    avatar_url: userInfo.avatar ?? userInfo.avatarUrl,
  };
};

export const useZaloCustomerProfile = () => {
  const [profile, setProfile] = useState<ZaloCustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { userInfo } = await getUserInfo({ autoRequestPermission: true });
      const normalizedProfile = normalizeZaloUserInfo(userInfo as ZaloUserInfo);

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
    refreshProfile: loadProfile,
  };
};
