export interface RouteConfig {
  path: string;
  title?: string;
  showHeader: boolean;
  showBackButton?: boolean;
  hideNavBottom?: boolean;
}

export const ROUTES: RouteConfig[] = [
  { path: "/", showHeader: false },
  { path: "/products", title: "Sản phẩm", showHeader: true, showBackButton: true },
  { path: "/order", showHeader: false },
  { path: "/vouchers", title: "Ưu đãi", showHeader: true },
  { path: "/contact", title: "Liên hệ", showHeader: true },
  { path: "/account", title: "Tài khoản", showHeader: true },
];
