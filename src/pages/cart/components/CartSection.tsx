import { AiOutlineDelete, AiOutlineShopping } from 'react-icons/ai';
import { LazyImage, QuantityStepper } from 'components/ui';
import { formatPrice, getMatchedPriceTier } from 'utils';
import { CartItem, useCartStore } from 'stores/cart';
interface CartSectionProps {
    items: CartItem[]
    handleRemoveItem: (itemId: string, productName: string) => void;
}
export const CartSection = ({ items, handleRemoveItem }: CartSectionProps) => {
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const updateNote = useCartStore((state) => state.updateNote);
    return (
        <section className="mb-4 overflow-hidden rounded-[28px] bg-[#FFF8F3] shadow-sm ring-1 ring-[#E8D9D0]">
            <div className="flex items-center justify-between gap-3 bg-white px-4 py-4">
                <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F5D6C8] text-lg text-[#33272A]">
                        <AiOutlineShopping />
                    </span>
                    <div>
                        <h2 className="font-heading text-lg font-extrabold text-title-text">Sản phẩm</h2>
                        <p className="text-xs font-semibold text-text-muted">{items.length} món đã chọn</p>
                    </div>
                </div>
            </div>
            {items.map((item) => {
                const itemId = item.id ?? (item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id);
                const matchedPriceTier = getMatchedPriceTier({
                    priceTiers: item.price_tiers,
                    quantity: item.quantity,
                    variantId: item.variant_id,
                });

                return (
                    <article key={itemId} className="mx-3 my-3 rounded-[24px] bg-white p-3 shadow-[0_6px_16px_rgba(91,62,44,0.07)] ring-1 ring-[#E8D9D0]">
                        <div className="flex gap-3">
                            <LazyImage
                                src={item.image}
                                alt={item.name}
                                wrapperClassName="h-[86px] w-[86px] shrink-0 rounded-2xl"
                                className="h-full w-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="line-clamp-2 font-heading text-base font-extrabold leading-5 text-text-main">
                                            {item.name}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-extrabold text-title-text">{formatPrice(item.price)}/cái</p>
                                            {item.stock_quantity <= 0 && (
                                                <span className="rounded-full bg-[#F5D6C8] px-2 py-0.5 text-[10px] font-extrabold text-[#33272A]">
                                                    Hết hàng
                                                </span>
                                            )}
                                        </div>
                                        {item.variant_name && (
                                            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-background-main px-2.5 py-1 text-[11px] font-bold text-text-muted">
                                                {item.variant_color_hex && (
                                                    <span
                                                        className="h-3 w-3 shrink-0 rounded-full ring-1 ring-text-main/10"
                                                        style={{ backgroundColor: item.variant_color_hex }}
                                                    />
                                                )}
                                                <span className="truncate">
                                                    {item.variant_color_name || item.variant_name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(itemId, item.name)}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF0EA] text-lg text-[#C96F4A]"
                                        aria-label="Xóa sản phẩm"
                                    >
                                        <AiOutlineDelete />
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <QuantityStepper
                                        value={item.quantity}
                                        max={item.stock_quantity > 0 ? item.stock_quantity : undefined}
                                        size="sm"
                                        onChange={(nextQuantity) => updateQuantity(itemId, nextQuantity)}
                                    />
                                    <p className="text-sm font-extrabold text-text-main">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                                {matchedPriceTier && (
                                    <p className="mt-2 text-[11px] font-bold leading-5 text-text-muted">
                                        Giá sỉ {matchedPriceTier.min_quantity}
                                        {matchedPriceTier.max_quantity ? `-${matchedPriceTier.max_quantity}` : "+"} cái:
                                        {" "}{formatPrice(matchedPriceTier.unit_price)}/cái
                                    </p>
                                )}
                            </div>
                        </div>

                        <textarea
                            value={item.note ?? ""}
                            onChange={(event) => updateNote(itemId, event.target.value)}
                            rows={2}
                            placeholder="Ghi chú riêng cho sản phẩm này nếu có..."
                            className="mt-3 w-full rounded-2xl border border-[#E8D9D0] bg-[#FFFDF9] p-3 text-sm text-text-main outline-none focus:border-[#C96F4A]"
                        />
                    </article>
                );
            })}
        </section>
    )
}
