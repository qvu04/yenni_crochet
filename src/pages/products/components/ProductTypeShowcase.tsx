import { AiOutlineCrown, AiOutlineFire, AiOutlinePlusCircle } from "react-icons/ai";
import { Products, ProductType } from "types";
import { BestSellerShowcase } from "./BestProductsShowcase";
import { NewProductsShowcase } from "./NewProductsShowcase";

interface ProductTypeShowcaseProps {
  products: Products[];
  productType: ProductType;
}
const getTypeCopy = (productType: ProductType) => {
  if (productType === "best_seller") {
    return {
      eyebrow: "Best seller",
      title: "Những món đang được chọn nhiều",
      description: "Các mẫu dễ tặng, dễ dùng và thường được khách quay lại đặt thêm.",
      icon: <AiOutlineCrown />,
    };
  }

  if (productType === "new") {
    return {
      eyebrow: "New arrivals",
      title: "Mẫu mới vừa lên kệ",
      description: "Một kệ nhỏ dành cho những món len mới được Yenni cập nhật gần đây.",
      icon: <AiOutlinePlusCircle />,
    };
  }

  return {
    eyebrow: "Pre-order",
    title: "Mẫu đặt trước",
    description: "Các món cần thêm thời gian chuẩn bị riêng trước khi giao đến bạn.",
    icon: <AiOutlineFire />,
  };
};

export const ProductTypeShowcase = ({ products, productType }: ProductTypeShowcaseProps) => {
  const copy = getTypeCopy(productType);
  return (
    <div>
      <section className={`mb-4 overflow-hidden rounded-[30px] p-4 shadow-[0_12px_30px_rgba(51,39,42,0.08)] ring-1 ring-text-main/5 ${productType === "new" ? "bg-white" : "bg-primary/30"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-muted">
              {copy.eyebrow}
            </p>
            <h1 className="mt-1 font-heading text-[28px] font-extrabold leading-8 text-title-text">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-text-muted">
              {copy.description}
            </p>
          </div>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-white text-2xl text-title-text shadow-sm">
            {copy.icon}
          </span>
        </div>
      </section>

      {productType === "best_seller" ? (
        <BestSellerShowcase products={products} />
      ) : (
        <NewProductsShowcase products={products} />
      )}
    </div>
  );
};
