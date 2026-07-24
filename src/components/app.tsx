import { useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "providers";
import { HomePage } from "pages/home";
import { Products } from "pages/products";
import { SplashScreen, ProductDetailSheet } from "components/common";
import { AppHeader, BottomNav } from "components/Layout";

export default function App() {
  const [isShowSplash, setIsShowSplash] = useState(true);

  if (isShowSplash) {
    return <SplashScreen onFinish={() => setIsShowSplash(false)} />;
  }

  return (
    <AppProviders>
      <MemoryRouter>
        <AppHeader />
        <div className="pb-[calc(64px+var(--zaui-safe-area-inset-bottom,0px))]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </div>
        <BottomNav />
        <ProductDetailSheet />
      </MemoryRouter>
    </AppProviders>
  );
}
