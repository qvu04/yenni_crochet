import { useState } from "react";
import { authenticateZaloWithSupabase } from "services/zalo-auth";

export const useZaloAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const signIn = async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      return await authenticateZaloWithSupabase({ forceRefresh: true });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Xác thực thất bại"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
};
