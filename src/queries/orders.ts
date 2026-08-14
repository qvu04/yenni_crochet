import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { orderServices } from "services";
import { CreateOrderInput, CustomerOrder, CustomerOrderFilter } from "types";

interface UseCreateOrderProps {
  options?: UseMutationOptions<string | null, Error, CreateOrderInput>
};
export const useCreateOrder = ({ options }: UseCreateOrderProps = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrderInput) => orderServices.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCT_BY_ID] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_BEST_SELLER_PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCTS_LIST] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_FEATURED_PRODUCTS_BY_TYPE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_USER_PROMOTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PROMOTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_CUSTOMER_ACCOUNT_SUMMARY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_CUSTOMER_ORDER_HISTORY] });
    },
    ...options,
  });
};

interface UseGetCustomerOrderHistoryProps {
  zaloUserId?: string;
  status?: CustomerOrderFilter;
  options?: Omit<UseQueryOptions<CustomerOrder[], Error>, "queryKey" | "queryFn">;
}

export const useGetCustomerOrderHistory = ({
  zaloUserId,
  status = "all",
  options,
}: UseGetCustomerOrderHistoryProps) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_CUSTOMER_ORDER_HISTORY, zaloUserId, status],
    queryFn: async () => {
      if (!zaloUserId) {
        throw new Error("Thiếu Zalo user id");
      }

      return orderServices.getCustomerOrderHistory(zaloUserId, status);
    },
    enabled: Boolean(zaloUserId),
    ...options,
  });
};

interface UseGetCustomerOrderDetailProps {
  zaloUserId?: string;
  orderId?: string;
  options?: Omit<UseQueryOptions<CustomerOrder, Error>, "queryKey" | "queryFn">;
}

export const useGetCustomerOrderDetail = ({
  zaloUserId,
  orderId,
  options,
}: UseGetCustomerOrderDetailProps) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_CUSTOMER_ORDER_DETAIL, zaloUserId, orderId],
    queryFn: async () => {
      if (!zaloUserId || !orderId) {
        throw new Error("Thiếu thông tin đơn hàng");
      }

      return orderServices.getCustomerOrderDetail(zaloUserId, orderId);
    },
    enabled: Boolean(zaloUserId && orderId),
    ...options,
  });
};
