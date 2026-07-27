import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { AiOutlineHome, AiOutlineEdit, AiOutlineUser, AiOutlineGift, AiOutlineMessage } from "react-icons/ai";
import { ROUTES } from "constant";
const TABS = [
  { key: "home", path: "/", label: "Trang chủ", icon: <AiOutlineHome /> },
  { key: "order", path: "/order", label: "Đặt riêng", icon: <AiOutlineEdit /> },
  { key: "voucher", path: "/vouchers", label: "Ưu đãi", icon: <AiOutlineGift /> },
  { key: "contact", path: "/contact", label: "Liên hệ", icon: <AiOutlineMessage /> },
  { key: "account", path: "/account", label: "Tài khoản", icon: <AiOutlineUser /> },
] as const;

export const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const route = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname));
  if (route?.hideNavBottom) return null;
  const activeKey = TABS.find((tab) => tab.path === pathname)?.key ?? TABS[0].key;

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
            className="relative flex flex-1 flex-col items-center gap-0.5"
          >
            {isActive && (
              <motion.span
                layoutId="bottomNavIndicator"
                className="absolute inset-x-3 -top-2 bottom-0 rounded-2xl bg-primary/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}

            <motion.span
              animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className={`relative z-10 text-xl mt-2 ${isActive ? "text-text-main" : "text-text-muted"}`}
            >
              {tab.icon}
            </motion.span>

            <span
              className={`relative z-10 text-[11px] font-semibold transition-colors ${isActive ? "text-text-main" : "text-text-muted"
                }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
