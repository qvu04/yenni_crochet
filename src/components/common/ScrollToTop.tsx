import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToTop = () => {
  window.scrollTo(0, 0);

  const scrollTargets = [
    document.scrollingElement,
    document.documentElement,
    document.body,
    document.getElementById("app"),
  ];

  scrollTargets.forEach((target) => {
    if (target) {
      target.scrollTop = 0;
      target.scrollLeft = 0;
    }
  });
};

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    scrollToTop();

    const firstFrame = window.requestAnimationFrame(() => {
      scrollToTop();
      window.requestAnimationFrame(scrollToTop);
    });

    return () => window.cancelAnimationFrame(firstFrame);
  }, [pathname, search]);

  return null;
};
