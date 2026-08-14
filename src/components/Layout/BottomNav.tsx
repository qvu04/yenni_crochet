import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AiOutlineHome, AiOutlineEdit, AiOutlineUser, AiOutlineGift, AiOutlineMessage } from "react-icons/ai";
import { ROUTES } from "constant";
const TABS = [
  { key: "home", path: "/", label: "Trang chủ", icon: <AiOutlineHome />, activeColor: "#F4A3A6" },
  { key: "order", path: "/order", label: "Đặt riêng", icon: <AiOutlineEdit />, activeColor: "#D97706" },
  { key: "voucher", path: "/vouchers", label: "Ưu đãi", icon: <AiOutlineGift />, activeColor: "#16A34A" },
  { key: "contact", path: "/contact", label: "Liên hệ", icon: <AiOutlineMessage />, activeColor: "#2563EB" },
  { key: "account", path: "/account", label: "Tài khoản", icon: <AiOutlineUser />, activeColor: "#7C3AED" },
] as const;

export const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const route = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname));
  if (route?.hideNavBottom) return null;
  const activeKey = TABS.find((tab) => tab.path === pathname || (tab.path !== "/" && pathname.startsWith(tab.path)))?.key ?? TABS[0].key;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[999] flex items-center justify-around rounded-t-2xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: "max(var(--zaui-safe-area-inset-bottom, 0px), 8px)" }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className="relative flex min-h-[64px] flex-1 flex-col items-center justify-center gap-0.5"
          >
            <motion.span
              animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative z-10 flex h-9 w-9 items-center justify-center text-xl"
              style={{ color: isActive ? tab.activeColor : "var(--color-text-muted)" }}
            >
              {isActive && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-full border-2 bg-white shadow-[0_8px_18px_rgba(51,39,42,0.12)]"
                  style={{ borderColor: tab.activeColor }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                {tab.icon}
              </span>
            </motion.span>

            <motion.span
              animate={{ color: isActive ? tab.activeColor : "var(--color-text-muted)" }}
              transition={{ duration: 0.18 }}
              className="relative z-10 text-[11px] font-semibold transition-colors"
            >
              {tab.label}
            </motion.span>

            {isActive && (
              <motion.span
                layoutId="bottomNavDot"
                className="relative z-10 mt-0.5 h-1 w-1 rounded-full"
                style={{ backgroundColor: tab.activeColor }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
