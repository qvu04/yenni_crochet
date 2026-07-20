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

import { Products } from "types";
import { supabase } from "./supabase";

export const productServices = {
  // TODO
  getBestSellerProducts: async (): Promise<Products[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true) // sản phẩm nổi bật nhưng đã ngừng bán thì cũng không nên hiện
      .limit(4);

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
    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  // Trang chi tiết sản phẩm — .single() bắt Supabase trả về 1 object thay vì mảng,
  // và tự báo lỗi nếu không tìm thấy đúng 1 dòng khớp id
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
};
