export interface ProductVariant {
    id: string;
    product_id: string;
    name: string;
    color_name: string | null;
    color_hex: string | null;
    images: string[];
    price: number | null;
    stock_quantity: number;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

export interface Products {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    estimated_days: string;
    allow_customization: boolean;
    is_active: boolean;
    is_featured: boolean;
    is_pre_order: boolean;
    stock_quantity: number;
    product_type: ProductType | null;
    product_variants?: ProductVariant[];
};
export type ProductType = "best_seller" | "new" | "pre_order";
export interface ProductBadge {
    key: string;
    label: string;
    className: string;
}
