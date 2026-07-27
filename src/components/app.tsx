import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "providers";
import { HomePage } from "pages/home";
import { Products } from "pages/products";
import { CustomRequestPage } from "pages/custom-request";
import { VouchersPage } from "pages/vouchers";
import { ContactPage } from "pages/contact";
import { AccountPage } from "pages/account";
import { CampaignSheet } from "pages/home/components";
import { SplashScreen, ProductDetailSheet, ScrollToTop } from "components/common";
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
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/order" element={<CustomRequestPage />} />
            <Route path="/vouchers" element={<VouchersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </div>
        <BottomNav />
        <CampaignSheet />
        <ProductDetailSheet />
      </MemoryRouter>
    </AppProviders>
  );
}
