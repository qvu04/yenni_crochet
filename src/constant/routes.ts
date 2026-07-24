export interface RouteConfig {
  path: string;
  title?: string;
  showHeader: boolean;
  showBackButton?: boolean;
  hideNavBottom?: boolean;
}

export const ROUTES: RouteConfig[] = [
  { path: "/", showHeader: false },
  { path: "/products", title: "Tất cả sản phẩm", showHeader: true, showBackButton: true },
];
