import { Suspense } from "react"
import { ProductDetail } from "./ProductDetail"

export const Detail = () => {
    return (
        <Suspense>
            <ProductDetail />
        </Suspense>
    )
}