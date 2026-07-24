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
};
export type ProductType = "best_seller" | "new" | "pre_order";
