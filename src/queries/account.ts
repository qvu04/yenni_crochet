import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { accountServices } from "services";
import { CustomerAccountSummary, CustomerProfile, UpsertCustomerProfileInput } from "types";

interface UseGetCustomerAccountSummaryProps {
  zaloUserId?: string;
  options?: UseQueryOptions<CustomerAccountSummary, Error>;
}

export const useGetCustomerAccountSummary = ({
  zaloUserId,
  options,
}: UseGetCustomerAccountSummaryProps) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_CUSTOMER_ACCOUNT_SUMMARY, zaloUserId],
    queryFn: async () => {
      if (!zaloUserId) {
        throw new Error("Thiếu Zalo user id");
      }

      return accountServices.getCustomerAccountSummary(zaloUserId);
    },
    enabled: Boolean(zaloUserId),
    ...options,
  });
};

interface UseUpsertCustomerProfileProps {
  options?: UseMutationOptions<CustomerProfile, Error, UpsertCustomerProfileInput>;
}

export const useUpsertCustomerProfile = ({ options }: UseUpsertCustomerProfileProps = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: accountServices.upsertCustomerProfile,
    onSuccess: (_profile, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_CUSTOMER_ACCOUNT_SUMMARY, variables.zalo_user_id],
      });
    },
    ...options,
  });
};
