import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { orderServices } from "services";
import { CreateOrderInput } from "types";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, CreateOrderInput>({
    mutationFn: (input: CreateOrderInput) => orderServices.createOrder(input),
    onSuccess: () => {
      // Trigger ở DB đã trừ stock_quantity — refetch lại để UI hiện đúng tồn kho mới
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCT_BY_ID] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_BEST_SELLER_PRODUCTS] });
    },
  });
};
