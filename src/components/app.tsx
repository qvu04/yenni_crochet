import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "providers";
import HomePage from "pages/home";

// ZMA chạy trong webview không có URL bar → dùng MemoryRouter
export default function App() {
  return (
    <AppProviders>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    </AppProviders>
  );
}
