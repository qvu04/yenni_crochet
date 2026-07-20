import { HomeHeader } from "components/Layout";
import { CamPaigns, ProductsListing } from "./components";

export default function Home() {
    return (
        <>
            <header>
                <HomeHeader />
            </header>
            <main>
                <ProductsListing />
                <CamPaigns />
            </main>
        </>
    );
}
