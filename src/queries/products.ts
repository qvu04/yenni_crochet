import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { productServices } from "services";
import { Products, ProductType } from "types";
interface UseGetActiveProducts {
    options?: UseQueryOptions<Products[], Error>
};
export const useGetActiveProducts = ({ options }: UseGetActiveProducts) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS],
        queryFn: async () => {
            const res = await productServices.getActiveProducts();
            return res;
        },
        ...options
    })
};

interface UseGetProductById {
    id: string;
    options?: UseQueryOptions<Products, Error>;
};
export const useGetProductById = ({ id, options }: UseGetProductById) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_PRODUCT_BY_ID, id],
        queryFn: async () => {
            const res = await productServices.getProductById(id);
            return res;
        },
        enabled: !!id,
        ...options
    })
};
interface UseGetFeaturedProductsByType {
    productType?: ProductType;
    preOrder?: boolean;
    options?: UseQueryOptions<Products[], Error>
}

export const useGetFeaturedProductsByType = ({ productType, preOrder, options }: UseGetFeaturedProductsByType) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_FEATURED_PRODUCTS_BY_TYPE, preOrder ? "pre_order" : (productType ?? "all")],
        queryFn: async () => {
            if (preOrder) {
                return productServices.getPreOrderProducts();
            }
            if (productType) {
                return productServices.getProductsByType(productType);
            }
            return productServices.getActiveProducts();
        },
        ...options
    })
}
