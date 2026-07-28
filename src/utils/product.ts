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

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const formatProductDescription = (description?: string | null): string => {
    if (!description?.trim()) return "";

    const htmlBlocks: string[] = [];
    const paragraphLines: string[] = [];
    const listItems: string[] = [];

    const flushParagraph = () => {
        if (paragraphLines.length === 0) return;

        htmlBlocks.push(`<p>${paragraphLines.map(escapeHtml).join("<br />")}</p>`);
        paragraphLines.length = 0;
    };

    const flushList = () => {
        if (listItems.length === 0) return;

        htmlBlocks.push(`<ul>${listItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`);
        listItems.length = 0;
    };

    description.split(/\r?\n/).forEach((rawLine) => {
        const line = rawLine.trim();

        if (!line) {
            flushParagraph();
            flushList();
            return;
        }

        const bulletMatch = line.match(/^[-*•]\s+(.+)/);
        if (bulletMatch) {
            flushParagraph();
            listItems.push(bulletMatch[1].trim());
            return;
        }

        flushList();
        paragraphLines.push(line);
    });

    flushParagraph();
    flushList();

    return htmlBlocks.join("");
};
