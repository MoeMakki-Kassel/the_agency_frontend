const TIER_PALETTE = [
  { bg: 'bg-violet-500', border: 'border-violet-600', ring: 'ring-violet-600', fill: '#8b5cf6', text: 'text-white' },
  { bg: 'bg-amber-500', border: 'border-amber-600', ring: 'ring-amber-600', fill: '#f59e0b', text: 'text-white' },
  { bg: 'bg-sky-500', border: 'border-sky-600', ring: 'ring-sky-600', fill: '#0ea5e9', text: 'text-white' },
  { bg: 'bg-fuchsia-500', border: 'border-fuchsia-600', ring: 'ring-fuchsia-600', fill: '#d946ef', text: 'text-white' },
  { bg: 'bg-teal-500', border: 'border-teal-600', ring: 'ring-teal-600', fill: '#14b8a6', text: 'text-white' },
  { bg: 'bg-orange-500', border: 'border-orange-600', ring: 'ring-orange-600', fill: '#f97316', text: 'text-white' },
] as const;

export type TierColorClasses = (typeof TIER_PALETTE)[number];

export function getTierColor(tierId: string, tierIndex?: number): TierColorClasses {
  if (tierIndex !== undefined && tierIndex >= 0) {
    return TIER_PALETTE[tierIndex % TIER_PALETTE.length];
  }
  let hash = 0;
  for (let i = 0; i < tierId.length; i++) {
    hash = (hash << 5) - hash + tierId.charCodeAt(i);
    hash |= 0;
  }
  return TIER_PALETTE[Math.abs(hash) % TIER_PALETTE.length];
}
