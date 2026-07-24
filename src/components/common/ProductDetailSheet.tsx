import { Sheet } from "zmp-ui";
import { useProductSheetStore } from "stores/productSheet";
import { ProductDetailContent } from "./ProductDetailContent";

export const ProductDetailSheet = () => {
  const selectedProductId = useProductSheetStore((s) => s.selectedProductId);
  const closeProduct = useProductSheetStore((s) => s.closeProduct);

  return (
    <Sheet
      visible={!!selectedProductId}
      onClose={closeProduct}
      height="85vh"
      swipeToClose
      unmountOnClose
      handler={false}
    >
      {selectedProductId && (
        <ProductDetailContent productId={selectedProductId} onClose={closeProduct} />
      )}
    </Sheet>
  );
};
