import { ProductPriceTier } from "types";

interface ResolveUnitPriceInput {
  basePrice: number;
  priceTiers?: ProductPriceTier[];
  quantity: number;
  variantId?: string | null;
}

export const hasBulkPricing = (priceTiers?: ProductPriceTier[]) =>
  (priceTiers ?? []).some((tier) => tier.is_active);

export const getVisiblePriceTiers = ({
  priceTiers,
  variantId,
}: {
  priceTiers?: ProductPriceTier[];
  variantId?: string | null;
}) => {
  const activeTiers = (priceTiers ?? []).filter((tier) => {
    return tier.is_active && (tier.variant_id === null || tier.variant_id === variantId);
  });

  const preferredTiers = new Map<string, ProductPriceTier>();

  activeTiers.forEach((tier) => {
    const rangeKey = `${tier.min_quantity}-${tier.max_quantity ?? "up"}`;
    const currentTier = preferredTiers.get(rangeKey);

    if (!currentTier || (tier.variant_id === variantId && currentTier.variant_id === null)) {
      preferredTiers.set(rangeKey, tier);
    }
  });

  return Array.from(preferredTiers.values()).sort((a, b) => {
    if (a.min_quantity !== b.min_quantity) {
      return a.min_quantity - b.min_quantity;
    }

    return a.sort_order - b.sort_order;
  });
};

export const getMatchedPriceTier = ({
  priceTiers,
  quantity,
  variantId,
}: Omit<ResolveUnitPriceInput, "basePrice">) => {
  const visibleTiers = getVisiblePriceTiers({ priceTiers, variantId });

  return visibleTiers.filter((tier) => {
    const isQuantityMatched =
      quantity >= tier.min_quantity && (tier.max_quantity === null || quantity <= tier.max_quantity);

    return isQuantityMatched;
  }).sort((a, b) => {
    if (a.min_quantity !== b.min_quantity) {
      return b.min_quantity - a.min_quantity;
    }

    return a.sort_order - b.sort_order;
  })[0];
};

export const resolveUnitPrice = ({
  basePrice,
  priceTiers,
  quantity,
  variantId,
}: ResolveUnitPriceInput) => {
  const matchedTier = getMatchedPriceTier({ priceTiers, quantity, variantId });
  return matchedTier?.unit_price ?? basePrice;
};

export const DEFAULT_DEPOSIT_RATE = 0.3;
export const DEFAULT_MAX_DEPOSIT_AMOUNT = 200000;

export const calculateDepositAmount = (
  totalAmount: number,
  depositRate = DEFAULT_DEPOSIT_RATE,
  maxDepositAmount = DEFAULT_MAX_DEPOSIT_AMOUNT,
) => {
  if (totalAmount <= 0) return 0;

  const roundedDeposit = Math.ceil((totalAmount * depositRate) / 1000) * 1000;

  return Math.min(totalAmount, roundedDeposit, maxDepositAmount);
};
