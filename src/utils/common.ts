export const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")}đ`;

export const getStockLabel = (stockQuantity: number) => {
    if (stockQuantity <= 0) {
        return "Hết hàng";
    }

    return `Còn ${stockQuantity} sản phẩm`;
};
export const formatDate = (value: string) => {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
};
