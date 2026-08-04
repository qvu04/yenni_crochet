import { AnimatePresence, motion } from "motion/react";
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
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
} as const;

export const AnimatedRoutes = () => {
  const location = useLocation();
  const route = ROUTES.find((item) => matchPath({ path: item.path, end: true }, location.pathname));
  const hasHeader = Boolean(route?.showHeader);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location.pathname}${location.search}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={pageTransition}
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
