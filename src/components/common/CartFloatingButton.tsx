import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { motion } from "motion/react";
import { getCartTotalQuantity, useCartStore } from "stores/cart";
import { useFlyToCartStore } from "stores/flyToCart";

export const CartFloatingButton = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const flyToCart = useFlyToCartStore((state) => state.flyToCart);
  const clearFlyToCart = useFlyToCartStore((state) => state.clearFlyToCart);
  const totalQuantity = getCartTotalQuantity(items);
  const isHome = pathname === "/";
  const target = typeof document !== "undefined"
    ? document.querySelector('[data-floating-cart-target="true"]') as HTMLElement | null
    : null;
  const targetRect = target?.getBoundingClientRect();

  if (!isHome) return null;

  return (
    <>
      <motion.button
        type="button"
        data-floating-cart-target="true"
        onClick={() => navigate("/cart")}
        className="fixed bottom-[calc(96px+var(--zaui-safe-area-inset-bottom,0px))] right-4 z-[998] flex h-14 w-14 items-center justify-center rounded-full bg-title-text text-2xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        animate={{ scale: totalQuantity > 0 ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.26 }}
      >
        <AiOutlineShoppingCart />
        {totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 text-xs font-extrabold text-text-main ring-2 ring-white">
            {totalQuantity}
          </span>
        )}
      </motion.button>

      {flyToCart && targetRect && (
        <motion.img
          key={flyToCart.id}
          src={flyToCart.src}
          alt={flyToCart.alt}
          className="pointer-events-none fixed z-[1200] rounded-2xl object-cover shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          initial={{
            top: flyToCart.startRect.top,
            left: flyToCart.startRect.left,
            width: flyToCart.startRect.width,
            height: flyToCart.startRect.height,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            top: [
              flyToCart.startRect.top,
              Math.max(16, flyToCart.startRect.top - 28),
              targetRect.top + targetRect.height / 2 - 12,
            ],
            left: [
              flyToCart.startRect.left,
              flyToCart.startRect.left + (targetRect.left - flyToCart.startRect.left) * 0.42,
              targetRect.left + targetRect.width / 2 - 12,
            ],
            width: [flyToCart.startRect.width, flyToCart.startRect.width * 0.72, 24],
            height: [flyToCart.startRect.height, flyToCart.startRect.height * 0.72, 24],
            opacity: [1, 1, 0.2],
            scale: [1, 0.9, 0.72],
          }}
          transition={{
            duration: 0.9,
            ease: [0.18, 0.88, 0.32, 1],
            times: [0, 0.38, 1],
          }}
          onAnimationComplete={clearFlyToCart}
        />
      )}
    </>
  );
};
