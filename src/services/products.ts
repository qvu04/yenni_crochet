// ============ BÀI: Products service ============
// Pattern *.service.ts giống weather.service.ts: 1 file thuần gọi data, không dính React.
// Khác biệt: weather gọi fetchInstance (REST thủ công), ở đây gọi supabase.from() (Supabase tự sinh API).
//
// TODO: viết hàm getActiveProducts() trong productServices:
// 1. Gọi supabase.from("products").select("*")
// 2. Lọc chỉ lấy sản phẩm đang bán — cột nào trong schema xử lý việc này? (gợi ý: is_active)
// 3. supabase trả về { data, error } — không throw như fetch. Câu hỏi tự trả lời:
//    nếu error khác null, hàm nên làm gì? (gợi ý: xem cách weather.service.ts để "as any"
//    hay throw Error, chọn cách phù hợp và giải thích được tại sao)
// 4. Return kiểu Product[] (đã định nghĩa ở types/index.ts)
//
// Docs: https://supabase.com/docs/reference/javascript/select

import { Products, ProductType } from "types";
import { supabase } from "./supabase";

export const productServices = {

  getProductById: async (id: string): Promise<Products> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
  getActiveProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  getProductsByType: async (productType: ProductType): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("product_type", productType)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  getPreOrderProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_pre_order", true)
      .limit(8)
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
};
