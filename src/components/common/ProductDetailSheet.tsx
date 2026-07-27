import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet } from "zmp-ui";
import { useProductSheetStore } from "stores/productSheet";
import { ProductDetailContent } from "./ProductDetailContent";
import { ModalSuccess } from "components/ui";

export const ProductDetailSheet = () => {
  const selectedProductId = useProductSheetStore((s) => s.selectedProductId);
  const closeProduct = useProductSheetStore((s) => s.closeProduct);
  const navigate = useNavigate();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const handleOrderSuccess = () => {
    closeProduct();
    setIsSuccessVisible(true);
  };

  const closeSuccessModal = () => {
    setIsSuccessVisible(false);
  };

  return (
    <>
      <Sheet
        visible={!!selectedProductId}
        onClose={closeProduct}
        height="85vh"
        swipeToClose
        unmountOnClose
        handler={false}
      >
        {selectedProductId && (
          <ProductDetailContent
            productId={selectedProductId}
            onClose={closeProduct}
            onOrderSuccess={handleOrderSuccess}
          />
        )}
      </Sheet>

      <ModalSuccess
        visible={isSuccessVisible}
        heading="Đặt hàng thành công!"
        title="Cảm ơn bạn đã đặt hàng — Yenni Crochet sẽ liên hệ đến bạn để xác nhận đơn sớm nhất nhé."
        onClose={closeSuccessModal}
        primaryAction={{
          label: "Đặt thêm sản phẩm khác",
          onClick: () => {
            closeSuccessModal();
            navigate("/products");
          },
        }}
        secondaryAction={{
          label: "Đóng",
          onClick: closeSuccessModal,
        }}
      />
    </>
  );
};
