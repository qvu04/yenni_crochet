// ============ BÀI: Products queries ============
// Pattern giống queries/weather.ts: tầng này chỉ bọc service bằng react-query,
// không tự gọi supabase trực tiếp ở đây.
//
// TODO: viết 2 hook:
// 1. useGetBestSellerProducts() — dùng useQuery, gọi productServices.getBestSellerProducts
//    queryKey: [QUERY_KEY.GET_BEST_SELLER_PRODUCTS]
//    (không cần "enabled" — không phụ thuộc tham số nào như latitude/longitude bên weather)
// 2. useGetActiveProducts() — tương tự, gọi productServices.getActiveProducts
//    queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS]
//
// Gợi ý: xem lại useGetCurrentWeather trong weather-zmp để nhớ hình dạng
// UseQueryOptions<T, Error>, queryFn async, và cách return useQuery({...}).

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { QUERY_KEY } from "constant";
import { productServices } from "services";
import { Products } from "types";
// TODO
interface UseGetBestSellerProducts {
    options?: UseQueryOptions<Products[], Error>
}
export const useGetBestSellerProducts = ({ options }: UseGetBestSellerProducts) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_BEST_SELLER_PRODUCTS],
        queryFn: async () => {
            const res = await productServices.getBestSellerProducts();
            return res;
        },
        ...options
    })
}
interface UseGetActiveProducts {
    options?: UseQueryOptions<Products[], Error>
}
export const useGetActiveProducts = ({ options }: UseGetActiveProducts) => {
    return useQuery({
        queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS],
        queryFn: async () => {
            const res = await productServices.getActiveProducts();
            return res;
        },
        ...options
    })
}

interface UseGetProductById {
    id: string;
    options?: UseQueryOptions<Products, Error>;
}
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
}