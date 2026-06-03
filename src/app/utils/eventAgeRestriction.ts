/** True when events.age_restriction (int2) is a positive minimum age. */
export function hasAgeRestriction(value: number | null | undefined): boolean {
  if (value == null) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= 1;
}

import { wrapLtr } from "./localeFormat";

/** e.g. 16 → "16+" (suffix only; no leading "+"); LTR-isolated for RTL pages. */
export function formatEventAgeRestriction(value: number): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return "";
  return wrapLtr(`${n}+`);
}
