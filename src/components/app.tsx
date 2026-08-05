import { useState } from "react";
import { matchPath, MemoryRouter, useLocation } from "react-router-dom";
import { AppProviders } from "providers";
import { ROUTES } from "constant";
import { CampaignSheet } from "pages/home/components";
import { AnimatedRoutes, CartFloatingButton, SplashScreen, ProductDetailSheet, ScrollToTop } from "components/common";
import { AppHeader, BottomNav } from "components/Layout";

const AppShell = () => {
  const { pathname } = useLocation();
  const route = ROUTES.find((item) => matchPath({ path: item.path, end: true }, pathname));
  const contentPaddingBottom = route?.hideNavBottom
    ? undefined
    : "calc(64px + var(--zaui-safe-area-inset-bottom, 0px))";

  return (
    <>
      <ScrollToTop />
      <AppHeader />
      <div style={{ paddingBottom: contentPaddingBottom }}>
        <AnimatedRoutes />
      </div>
      <BottomNav />
      <CartFloatingButton />
      <CampaignSheet />
      <ProductDetailSheet />
    </>
  );
};

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <AppProviders>
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>
    </AppProviders>
  );
}
