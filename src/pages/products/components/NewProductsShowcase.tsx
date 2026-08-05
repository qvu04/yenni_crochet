import { motion } from 'motion/react';
import { ProductCard } from 'components/common';
import { Products } from 'types';
export const NewProductsShowcase = ({ products }: { products: Products[] }) => {
    const featuredProducts = products.slice(0, 3);
    const remainingProducts = products.slice(3);

    return (
        <div className="space-y-4 pb-6">
            <section className="-mx-5 overflow-hidden">
                <div className="scrollbar-none flex gap-3 overflow-x-auto px-5 pb-1">
                    {featuredProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.24, delay: index * 0.04, ease: "easeOut" }}
                            className="w-[78%] max-w-[310px] shrink-0"
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
            </section>

            {remainingProducts.length > 0 && (
                <section>
                    <div className="mb-3 flex items-end justify-between gap-3">
                        <div>
                            <h2 className="font-heading text-lg font-extrabold text-title-text">Mới cập nhật thêm</h2>
                            <p className="mt-1 text-xs font-semibold text-text-muted">Những mẫu mới còn lại trong kệ.</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-text-muted ring-1 ring-text-main/5">
                            {remainingProducts.length} mẫu
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {remainingProducts.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.16), ease: "easeOut" }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};