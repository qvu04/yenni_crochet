import { Suspense } from "react";
import { ProductsPage } from "./ProductsPage";

export const Products = () => {
  return (
    <Suspense>
      <ProductsPage />
    </Suspense>
  );
};
