/** Left-to-right isolate (Unicode) — keeps digits, +, email in correct order inside RTL paragraphs. */
const LRI = "\u2066";
const PDI = "\u2069";

export function wrapLtr(value: string): string {
  if (!value) return value;
  return `${LRI}${value}${PDI}`;
}

export function formatDecimal(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatMoneyAmount(
  amount: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return formatDecimal(amount, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
}

/** Price with translated currency label; number is LTR-isolated for correct RTL layout. */
export function formatPriceWithCurrency(
  amount: number,
  locale: string,
  currencyLabel: string,
): string {
  return `${wrapLtr(formatMoneyAmount(amount, locale))} ${currencyLabel}`;
}

/** e.g. "From" + amount + currency */
export function formatPriceFrom(
  amount: number,
  locale: string,
  fromLabel: string,
  currencyLabel: string,
): string {
  return `${fromLabel} ${formatPriceWithCurrency(amount, locale, currencyLabel)}`;
}

/** Discount line: negative amount + currency, LTR-isolated. */
export function formatDiscountAmount(
  amount: number,
  locale: string,
  currencyLabel: string,
): string {
  const n = formatMoneyAmount(amount, locale);
  return wrapLtr(`-${n} ${currencyLabel}`);
}

/** E.164 or raw digits for display (always Western digits, LTR). */
export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (phone == null) return "";
  const raw = String(phone).trim();
  if (!raw) return "";
  return wrapLtr(raw);
}

/** Label + phone, e.g. "Sales: +962…" — phone part isolated. */
export function formatLabeledPhone(
  label: string | null | undefined,
  phone: string,
): string {
  const p = formatPhoneForDisplay(phone);
  if (label?.trim()) return `${label.trim()}: ${p}`;
  return p;
}

/** International dial prefix for country selector. */
export function formatDialCode(dial: string): string {
  return wrapLtr(`+${dial.replace(/\D/g, "")}`);
}

/** Email addresses stay LTR in RTL UI. */
export function formatEmailForDisplay(email: string | null | undefined): string {
  if (email == null) return "";
  const raw = String(email).trim();
  if (!raw) return "";
  return wrapLtr(raw);
}

/** Seat labels, refs, OTP — Latin/numbers in RTL. */
export function formatLatinForDisplay(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  return wrapLtr(String(value));
}
