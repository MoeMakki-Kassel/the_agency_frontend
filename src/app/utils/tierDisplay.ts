export interface TierDisplayInput {
  name: string;
  price: number;
  selection_mode?: 'assigned' | 'general_admission';
  venue_tier_key?: string;
}

export function isRegularTier(tier: TierDisplayInput): boolean {
  return (
    tier.selection_mode === 'general_admission' ||
    tier.venue_tier_key === 'regular' ||
    /^general\s+admission$/i.test(tier.name.trim())
  );
}

/** Storefront label for GA / regular tier (default English). */
export function displayTierName(tier: TierDisplayInput, regularLabel = 'Regular'): string {
  return isRegularTier(tier) ? regularLabel : tier.name;
}

export function sortTiersByPriceDesc<T extends { price: number }>(tiers: readonly T[]): T[] {
  return [...tiers].sort((a, b) => Number(b.price) - Number(a.price));
}
