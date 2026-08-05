import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef } from "react";
import { matchPath, Route, Routes, useLocation } from "react-router-dom";
import { ROUTES } from "constant";
import { CartPage } from "pages/cart";
import { AccountPage } from "pages/account";
import { OrderDetailPage, OrderHistoryPage } from "pages/account/orders";
import { ContactPage } from "pages/contact";
import { CustomRequestPage } from "pages/custom-request";
import { HomePage } from "pages/home";
import { Products } from "pages/products";
import { VouchersPage } from "pages/vouchers";

const pageTransition = {
  type: "tween",
  duration: 0.24,
  ease: [0.22, 1, 0.36, 1],
} as const;

const getRouteDepth = (pathname: string) => {
  if (matchPath({ path: "/account/orders/:orderId", end: true }, pathname)) return 2;
  if (matchPath({ path: "/account/orders", end: true }, pathname)) return 1;
  if (matchPath({ path: "/cart", end: true }, pathname)) return 1;

  return 0;
};

const pageVariants = {
  initial: (direction: number) => (
    direction === 0
      ? { opacity: 0, y: 6, scale: 0.995 }
      : { opacity: 0, x: direction > 0 ? 28 : -28 }
  ),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
  exit: (direction: number) => (
    direction === 0
      ? { opacity: 0, y: -4, scale: 0.998 }
      : { opacity: 0, x: direction > 0 ? -20 : 20 }
  ),
};

export const AnimatedRoutes = () => {
  const location = useLocation();
  const route = ROUTES.find((item) => matchPath({ path: item.path, end: true }, location.pathname));
  const hasHeader = Boolean(route?.showHeader);
  const routeDepth = useMemo(() => getRouteDepth(location.pathname), [location.pathname]);
  const previousRouteDepthRef = useRef(routeDepth);
  const routeDirection = routeDepth === previousRouteDepthRef.current
    ? 0
    : routeDepth > previousRouteDepthRef.current
      ? 1
      : -1;

  useEffect(() => {
    previousRouteDepthRef.current = routeDepth;
  }, [routeDepth]);

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={routeDirection}>
      <motion.div
        key={`${location.pathname}${location.search}`}
        custom={routeDirection}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ willChange: "transform, opacity" }}
        className={`min-h-dvh ${hasHeader ? "pt-[calc(56px+var(--zaui-safe-area-inset-top,0px))]" : ""}`}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/order" element={<CustomRequestPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/orders" element={<OrderHistoryPage />} />
          <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};
