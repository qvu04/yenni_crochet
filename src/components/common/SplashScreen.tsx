import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import styled from "styled-components";
import shopImg from "src/assets/images/shop.webp";
const SPLASH_DURATION = 2500;
const SCREEN2_DELAY = 1000;
const EXIT_DELAY = 2000;

const SplashWrapper = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-header-bg);
`;

const Screen = styled(motion.div)`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff;
`;

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [showScreen2, setShowScreen2] = useState(false);
  const controls = useAnimationControls();

  useEffect(() => {
    const screen2Timeout = setTimeout(() => setShowScreen2(true), SCREEN2_DELAY);
    const exitTimeout = setTimeout(() => controls.start("exit"), EXIT_DELAY);
    const hideTimeout = setTimeout(onFinish, SPLASH_DURATION);

    return () => {
      clearTimeout(screen2Timeout);
      clearTimeout(exitTimeout);
      clearTimeout(hideTimeout);
    };
  }, [controls, onFinish]);

  return (
    <SplashWrapper
      initial={{ opacity: 1 }}
      animate={controls}
      variants={{ exit: { opacity: 0 } }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <Screen
        animate={
          showScreen2
            ? { opacity: 0, scale: 1.2, filter: "blur(10px)" }
            : { opacity: 1, scale: 1, filter: "blur(0px)" }
        }
        transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
        style={{ pointerEvents: showScreen2 ? "none" : "auto" }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1],
            type: "spring",
            stiffness: 120,
            damping: 15,
          }}
        >
          <img src={shopImg} alt="logo_shop" className="h-28 w-28 shrink-0 rounded-full object-cover ring-2 ring-white/60 shadow-md" />
        </motion.div>
      </Screen>

      <Screen
        initial={{ opacity: 0 }}
        animate={showScreen2 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ pointerEvents: !showScreen2 ? "none" : "auto" }}
      >
        <motion.p
          className="font-heading text-3xl font-bold uppercase tracking-wide text-title-text"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={
            showScreen2 ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }
          }
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          Yenni Crochet
        </motion.p>
        <motion.p
          className="mt-1 text-sm text-title-text"
          initial={{ opacity: 0, y: 10 }}
          animate={showScreen2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          Móc len thủ công, làm theo yêu cầu 🧶
        </motion.p>
      </Screen>
    </SplashWrapper>
  );
};
