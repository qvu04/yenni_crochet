import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { AppProviders } from "providers";
import { CampaignSheet } from "pages/home/components";
import { AnimatedRoutes, CartFloatingButton, SplashScreen, ProductDetailSheet, ScrollToTop } from "components/common";
import { AppHeader, BottomNav } from "components/Layout";

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <AppProviders>
      <MemoryRouter>
        <ScrollToTop />
        <AppHeader />
        <div className="pb-[calc(64px+var(--zaui-safe-area-inset-bottom,0px))]">
          <AnimatedRoutes />
        </div>
        <BottomNav />
        <CartFloatingButton />
        <CampaignSheet />
        <ProductDetailSheet />
      </MemoryRouter>
    </AppProviders>
  );
}
