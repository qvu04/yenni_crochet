import { PropsWithChildren } from "react";
import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { handleAppError } from "utils";

// Export riêng để dùng được ngoài React (invalidate từ service/socket sau này)
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data === undefined) return;

      handleAppError(error, {
        component: "ReactQuery",
        action: "backgroundRefetch",
        fallback: "Dữ liệu chưa cập nhật được, bạn thử kéo xuống làm mới nhé.",
      });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000,
    },
  },
});

// zustand không cần Provider — chỉ react-query cần
export function AppProviders({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
