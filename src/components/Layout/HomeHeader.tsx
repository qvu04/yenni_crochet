import { AnimatePresence, motion } from "motion/react";
import * as React from "react";
import { YarnBallIcon } from "components/icons";
import shopImg from "src/assets/images/shop.webp";
export function HomeHeader() {
  const headerRef = React.useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      setShowSticky(window.scrollY > headerHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.div
        ref={headerRef}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-b-2xl bg-header-bg px-5 pb-5 pt-[var(--header-padding-top)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            clipPath: "polygon(0 0, 80% 0, 30% 100%, 0% 100%)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* <YarnBallIcon className="pointer-events-none absolute -bottom-4 -right-6 h-28 w-28 text-title-text" /> */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={shopImg}
            alt="Yenni Crochet"
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white/60 shadow-md"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-title-text">
              Tiệm len thủ công
            </p>
            <p className="font-heading text-2xl font-bold uppercase leading-tight text-title-text">
              Yenni Crochet
            </p>
            <p className="mt-0.5 text-xs text-title-text">Móc len thủ công, làm theo yêu cầu 🧶</p>
          </div>
        </div>

        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-title-text">
            100% thủ công
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-title-text">
            Nhận sản phẩm theo yêu cầu
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-title-text">
            Đảm bảo chất lượng sản phẩm
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-title-text">
            Luôn lắng nghe ý kiến từ khách hàng
          </span>
        </div>
      </motion.div>
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed left-0 right-0 top-0 z-[100] bg-header-bg px-5 pb-3 shadow-md"
            style={{ paddingTop: "var(--header-padding-top)" }}
          >
            <p className="font-heading text-sm font-bold uppercase text-white">Yenni Crochet</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


