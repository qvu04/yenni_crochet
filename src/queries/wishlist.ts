import { MutationFunctionContext, useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { wishlistServices } from "services";
import { ToggleFavoriteInput, ToggleFavoriteResult, WishlistItem } from "types";

interface UseGetUserWishlistProps {
  zaloUserId?: string;
  options?: UseQueryOptions<WishlistItem[], Error>;
}

export const useGetUserWishlist = ({ zaloUserId, options }: UseGetUserWishlistProps) => {
  return useQuery({
    queryKey: [QUERY_KEY.GET_USER_WISHLIST, zaloUserId],
    queryFn: async () => {
      if (!zaloUserId) {
        throw new Error("Thiếu Zalo user id");
      }

      return wishlistServices.getUserWishlist(zaloUserId);
    },
    enabled: Boolean(zaloUserId),
    ...options,
  });
};

interface UseIsProductFavoritedProps {
  zaloUserId?: string;
  productId?: string;
  options?: UseQueryOptions<boolean, Error>;
}

export const useIsProductFavorited = ({
  zaloUserId,
  productId,
  options,
}: UseIsProductFavoritedProps) => {
  return useQuery({
    queryKey: [QUERY_KEY.IS_PRODUCT_FAVORITED, zaloUserId, productId],
    queryFn: async () => {
      if (!zaloUserId || !productId) {
        throw new Error("Thiếu thông tin wishlist");
      }

      return wishlistServices.isProductFavorited({ zaloUserId, productId });
    },
    enabled: Boolean(zaloUserId && productId),
    ...options,
  });
};

interface UseToggleFavoriteProductProps {
  options?: UseMutationOptions<ToggleFavoriteResult, Error, ToggleFavoriteInput>;
}

export const useToggleFavoriteProduct = ({ options }: UseToggleFavoriteProductProps = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...mutationOptions } = options ?? {};

  return useMutation({
    mutationFn: wishlistServices.toggleFavoriteProduct,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<WishlistItem[]>(
        [QUERY_KEY.GET_USER_WISHLIST, variables.zaloUserId],
        (currentItems) => result.is_favorited
          ? currentItems
          : currentItems?.filter((item) => item.product_id !== variables.productId),
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.GET_USER_WISHLIST, variables.zaloUserId],
      });
      queryClient.setQueryData(
        [QUERY_KEY.IS_PRODUCT_FAVORITED, variables.zaloUserId, variables.productId],
        result.is_favorited,
      );
      const mutationContext: MutationFunctionContext = {
        client: queryClient,
        meta: mutationOptions.meta,
        mutationKey: mutationOptions.mutationKey,
      };

      onSuccess?.(result, variables, undefined, mutationContext);
    },
    ...mutationOptions,
  });
};
