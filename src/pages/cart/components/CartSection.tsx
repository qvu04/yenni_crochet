import { AiOutlineDelete, AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import { formatPrice, getMatchedPriceTier, getStockLabel } from 'utils';
import { CartItem, useCartStore } from 'stores/cart';
interface CartSectionProps {
    items: CartItem[]
    handleRemoveItem: (itemId: string, productName: string) => void;
}
export const CartSection = ({ items, handleRemoveItem }: CartSectionProps) => {
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const updateNote = useCartStore((state) => state.updateNote);
    return (
        <section className="mb-5 space-y-3">
            {items.map((item) => {
                const itemId = item.id ?? (item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id);
                const matchedPriceTier = getMatchedPriceTier({
                    priceTiers: item.price_tiers,
                    quantity: item.quantity,
                    variantId: item.variant_id,
                });

                return (
                    <article key={itemId} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-text-main/5">
                        <div className="flex gap-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="line-clamp-2 font-heading text-base font-bold leading-5 text-text-main">
                                            {item.name}
                                        </h2>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-extrabold text-title-text">{formatPrice(item.price)}/cái</p>
                                            {/* {matchedPriceTier && (
                                                <span className="rounded-full bg-primary/60 px-2 py-0.5 text-[10px] font-extrabold text-title-text">
                                                    Giá sỉ
                                                </span>
                                            )} */}
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
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-main text-lg text-[#B91C1C]"
                                    >
                                        <AiOutlineDelete />
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 rounded-full bg-background-main px-2 py-1">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-text-main shadow-sm"
                                        >
                                            <AiOutlineMinus />
                                        </button>
                                        <span className="w-7 text-center text-sm font-bold text-text-main">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-text-main shadow-sm"
                                        >
                                            <AiOutlinePlus />
                                        </button>
                                    </div>
                                    {/* <p className={`text-[10px] font-bold ${item.stock_quantity > 0 ? "text-text-muted" : "text-[#B91C1C]"}`}>
                                    {getStockLabel(item.stock_quantity)}
                                </p> */}
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
                            className="mt-3 w-full rounded-2xl border border-background-main bg-background-main p-3 text-sm text-text-main outline-none focus:border-primary"
                        />
                    </article>
                );
            })}
        </section>
    )
}
