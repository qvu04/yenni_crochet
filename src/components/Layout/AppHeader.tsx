import { matchPath, useLocation } from "react-router-dom";
import { Header } from "zmp-ui";
import { ROUTES } from "constant";

export const AppHeader = () => {
  const { pathname } = useLocation();
  const route = ROUTES.find((r) => matchPath({ path: r.path, end: true }, pathname));

  if (!route?.showHeader) return null;

  return (
    <Header
      title={route.title}
      showBackIcon={route.showBackButton}
      backgroundColor="var(--color-header-bg)"
      textColor="#ffffff"
    />
  );
};
