import { useCallback, useEffect, useState } from "react";
import { getZaloSession, ZaloSession } from "services/zalo-session";

export const useZaloSession = () => {
  const [session, setSession] = useState<ZaloSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await getZaloSession({ forceRefresh: true });

      if (!nextSession) {
        throw new Error("Chưa xác thực được tài khoản Zalo.");
      }

      setSession(nextSession);
      return nextSession;
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error("Chưa xác thực được tài khoản Zalo.");
      setError(nextError);
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getZaloSession()
      .then((nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setError(nextSession ? null : new Error("Chưa xác thực được tài khoản Zalo."));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error("Chưa xác thực được tài khoản Zalo."));
      })
      .then(() => {
        if (isMounted) setIsLoading(false);
      }, () => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    session,
    profile: session?.profile ?? null,
    accessToken: session?.accessToken ?? null,
    isLoading,
    error,
    refreshSession,
  };
};
