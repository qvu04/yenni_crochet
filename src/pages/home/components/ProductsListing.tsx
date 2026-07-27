import { AllProductsIcon, BestSellerIcon, NewIcon } from "components/icons";
import { FeaturedProductRow } from "./FeaturedProductRow";
export const ProductsListing = () => {
    return (
        <section>
            <div className="space-y-5">
                <FeaturedProductRow
                    title="Sản phẩm bán chạy"
                    productType="best_seller"
                    icon={<BestSellerIcon className="h-8 w-8 text-title-text" />}
                />
                <FeaturedProductRow
                    title="Sản phẩm mới"
                    productType="new"
                    icon={<NewIcon className="h-8 w-8 text-title-text" />}
                />
                <FeaturedProductRow
                    title="Tất cả sản phẩm"
                    icon={<AllProductsIcon className="h-8 w-8 text-title-text" />}
                />
            </div>
        </section>
    );
};
