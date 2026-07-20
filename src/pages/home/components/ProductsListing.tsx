import { useNavigate } from "react-router-dom";
import { useGetBestSellerProducts } from "queries/products";
import { ProductCard } from "components/common";
export const ProductsListing = () => {
    const { data: products, isLoading, isError } = useGetBestSellerProducts({});
    const navigate = useNavigate();

    return (
        <section className="px-5 pt-6">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-main">🔥 Sản phẩm nổi bật</h2>
                <button
                    onClick={() => navigate("/products")}
                    className="text-sm font-semibold text-primary"
                >
                    Xem tất cả
                </button>
            </div>

            {isLoading && (
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl bg-background-main" />
                    ))}
                </div>
            )}

            {isError && (
                <p className="rounded-2xl bg-background-main p-4 text-sm text-text-muted">
                    Không tải được sản phẩm, thử lại sau nhé.
                </p>
            )}

            {!isLoading && !isError && products?.length === 0 && (
                <p className="rounded-2xl bg-background-main p-4 text-sm text-text-muted">
                    Chưa có sản phẩm nổi bật nào.
                </p>
            )}

            {!isLoading && !isError && products && products.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};
