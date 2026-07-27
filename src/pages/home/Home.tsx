import { PullToRefresh } from "antd-mobile";
import { useQueryClient } from "@tanstack/react-query";
import { HomeHeader } from "components/Layout";
import { QUERY_KEY } from "constant";
import { motion } from "motion/react";
import { AiOutlineEdit, AiOutlineGift, AiOutlineMessage, AiOutlineUnorderedList } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { CamPaigns, ProductsListing } from "./components";

const quickActions = [
    { label: "Đặt riêng", path: "/order", icon: <AiOutlineEdit /> },
    { label: "Ưu đãi", path: "/vouchers", icon: <AiOutlineGift /> },
    { label: "Sản phẩm", path: "/products", icon: <AiOutlineUnorderedList /> },
    { label: "Liên hệ", path: "/contact", icon: <AiOutlineMessage /> },
] as const;

export default function Home() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleRefresh = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_FEATURED_PRODUCTS_BY_TYPE] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_UPCOMING_CAMPAIGNS] }),
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCTS_LIST] }),
        ]);
    };

    return (
        <PullToRefresh
            pullingText="Kéo xuống để làm mới"
            canReleaseText="Thả tay để làm mới"
            refreshingText="Đang làm mới..."
            completeText="Đã cập nhật"
            onRefresh={handleRefresh}
        >
            <header>
                <HomeHeader />
            </header>

            <motion.main
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative z-10 flex flex-col gap-5 px-4 py-5"
            >
                <section className="grid grid-cols-4 gap-2">
                    {quickActions.map((action) => (
                        <button
                            key={action.path}
                            type="button"
                            onClick={() => navigate(action.path)}
                            className="flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-2xl bg-white/80 px-2 py-3 text-center shadow-[0_10px_24px_rgba(51,39,42,0.07)] ring-1 ring-text-main/5 transition active:scale-[0.98]"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xl text-title-text">
                                {action.icon}
                            </span>
                            <span className="text-[11px] font-bold leading-4 text-text-main">
                                {action.label}
                            </span>
                        </button>
                    ))}
                </section>

                <CamPaigns />
                <ProductsListing />
            </motion.main>
        </PullToRefresh>
    );
}
