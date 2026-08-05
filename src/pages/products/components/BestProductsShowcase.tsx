import { useProductSheetStore } from 'stores/productSheet';
import { Products } from 'types';
import { formatPrice, getStockLabel } from 'utils';
export const BestSellerShowcase = ({ products }: { products: Products[] }) => {
    const openProduct = useProductSheetStore((state) => state.openProduct);
    const [spotlightProduct, ...rankedProducts] = products;

    if (!spotlightProduct) return null;
    const getProductImage = (product: Products) => product.images?.[0];

    return (
        <div className="space-y-4 pb-6">
            <button
                type="button"
                onClick={() => openProduct(spotlightProduct.id)}
                className="group relative min-h-[250px] w-full overflow-hidden rounded-[30px] bg-title-text text-left shadow-[0_16px_36px_rgba(92,64,51,0.2)] active:scale-[0.99]"
            >
                {getProductImage(spotlightProduct) ? (
                    <img
                        src={getProductImage(spotlightProduct)}
                        alt={spotlightProduct.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-85 transition duration-300 group-active:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-primary/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-title-text via-title-text/30 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-title-text shadow-sm">
                    Top 1 best seller
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">Khách chọn nhiều nhất</p>
                    <h2 className="mt-1 line-clamp-2 font-heading text-2xl font-extrabold leading-8">
                        {spotlightProduct.name}
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="font-heading text-xl font-extrabold">{formatPrice(spotlightProduct.price)}</p>
                        <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold">
                            {getStockLabel(spotlightProduct.stock_quantity)}
                        </span>
                    </div>
                </div>
            </button>

            {rankedProducts.length > 0 && (
                <section className="rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-text-main/5">
                    <div className="px-1 pb-2">
                        <h2 className="font-heading text-lg font-extrabold text-title-text">Bảng xếp hạng nhỏ</h2>
                        <p className="mt-1 text-xs font-semibold text-text-muted">Các mẫu bán chạy còn lại để bạn so nhanh.</p>
                    </div>
                    <div className="space-y-2">
                        {rankedProducts.map((product, index) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => openProduct(product.id)}
                                className="flex w-full items-center gap-3 rounded-2xl bg-background-main/80 p-2 text-left transition active:scale-[0.99]"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-title-text font-heading text-sm font-extrabold text-white">
                                    #{index + 2}
                                </span>
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white">
                                    {getProductImage(product) ? (
                                        <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-text-muted">YC</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-extrabold leading-5 text-text-main">{product.name}</p>
                                    <p className="mt-1 text-xs font-bold text-title-text">{formatPrice(product.price)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};