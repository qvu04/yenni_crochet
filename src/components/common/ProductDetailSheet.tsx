import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet } from "zmp-ui";
import { useProductSheetStore } from "stores/productSheet";
import { ProductDetailContent } from "./ProductDetailContent";
import { ModalSuccess } from "components/ui";
import { QUERY_KEY } from "constant";

export const ProductDetailSheet = () => {
  const selectedProductId = useProductSheetStore((s) => s.selectedProductId);
  const closeProduct = useProductSheetStore((s) => s.closeProduct);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);

  const handleOrderSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCT_BY_ID, selectedProductId] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_PRODUCTS_LIST] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_FEATURED_PRODUCTS_BY_TYPE] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_ACTIVE_PRODUCTS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_UPCOMING_CAMPAIGNS] });
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
