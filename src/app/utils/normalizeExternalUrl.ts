const HOSTNAME_RE = /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/|$)/i;

function looksLikeAbsoluteUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("//") || HOSTNAME_RE.test(s);
}

/**
 * Ensures footer/social links are absolute URLs. Relative paths like "instagram_url"
 * would otherwise resolve to https://theagencyjo.com/instagram_url.
 */
export function normalizeExternalUrl(
  raw: string | null | undefined,
  fallback: string,
): string {
  const s = raw?.trim();
  if (!s || !looksLikeAbsoluteUrl(s)) return fallback;

  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;

  return `https://${s.replace(/^\/+/, "")}`;
}

/** Returns a storable absolute URL, or null if the value is empty or not a real link. */
export function coerceExternalUrlForSave(raw: string | null | undefined): string | null {
  const s = raw?.trim();
  if (!s || !looksLikeAbsoluteUrl(s)) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://${s.replace(/^\/+/, "")}`;
}
