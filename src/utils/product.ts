import { preOrderBadge, productTypeBadges } from 'pages/products/ProductsPage';
import { ProductBadge, Products } from 'types';

export const getProductBadges = (product: Products): ProductBadge[] => {
    const badges: ProductBadge[] = [];

    if (product.product_type) {
        badges.push(productTypeBadges[product.product_type]);
    }

    if (product.is_pre_order && product.product_type !== "pre_order") {
        badges.push(preOrderBadge);
    }

    return badges;
};
