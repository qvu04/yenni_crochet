import { getAccessToken, getUserInfo } from "zmp-sdk/apis";
import { ZaloCustomerProfile } from "types";

interface ZaloUserInfo {
  id?: string;
  name?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface ZaloSession {
  accessToken: string;
  profile: ZaloCustomerProfile;
}

let sessionPromise: Promise<ZaloSession | null> | null = null;
let cachedSession: ZaloSession | null = null;

const normalizeZaloUserInfo = (userInfo: ZaloUserInfo): ZaloCustomerProfile | null => {
  if (!userInfo.id) return null;

  return {
    zalo_user_id: userInfo.id,
    display_name: userInfo.name,
    avatar_url: userInfo.avatar ?? userInfo.avatarUrl,
  };
};

export const getZaloSession = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh && cachedSession) return cachedSession;
  if (!forceRefresh && sessionPromise) return sessionPromise;

  sessionPromise = Promise.all([
    getAccessToken(),
    getUserInfo({ autoRequestPermission: true }),
  ])
    .then(([accessToken, { userInfo }]) => {
      const profile = normalizeZaloUserInfo(userInfo as ZaloUserInfo);

      if (!accessToken || !profile) {
        throw new Error("Chưa xác thực được tài khoản Zalo.");
      }

      cachedSession = { accessToken, profile };
      return cachedSession;
    })
    .catch(() => null)
    .then((session) => {
      sessionPromise = null;
      return session;
    }, (error) => {
      sessionPromise = null;
      throw error;
    });

  return sessionPromise;
};

export const clearZaloSessionCache = () => {
  cachedSession = null;
  sessionPromise = null;
};
