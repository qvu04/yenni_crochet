import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { orderServices } from "services";
import { CreateOrderInput } from "types";

interface UseCreateOrderProps {
  options?: UseMutationOptions<void, Error, CreateOrderInput>
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
    },
    ...options,
  });
};
