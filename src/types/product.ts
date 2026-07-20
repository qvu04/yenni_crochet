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
    stock_quantity: number;
}