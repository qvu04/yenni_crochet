-- Yenni Crochet - remove redundant product_variants.image_url
-- Run manually only if you decide to store variant images exclusively in images[].
--
-- Current frontend uses:
-- - product_variants.images when a variant has its own images
-- - products.images as fallback when product_variants.images is empty

alter table public.product_variants
drop column if exists image_url;
