import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "providers";
import { HomePage } from "pages/home";
import { Detail } from "pages/product-detail";
import { Products } from "pages/products";
export default function App() {
  return (
    <AppProviders>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Detail />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}
