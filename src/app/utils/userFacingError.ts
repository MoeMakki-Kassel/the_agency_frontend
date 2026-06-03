import axios from "axios";

export const GENERIC_ERROR = "Something went wrong. Please try again.";

const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  phone: "Phone number",
  age: "Age",
  email: "Email address",
  token: "Verification code",
  code: "Promo code",
};

const INTERNAL_HINTS = [
  "duplicate key",
  "violates foreign key",
  "violates unique",
  "violates check",
  "violates not-null",
  "postgres",
  "postgresql",
  "pgrst",
  "supabase",
  'relation "',
  "relation '",
  "syntax error",
  "constraint ",
  "insert into ",
  'update "',
  "delete from ",
  "23505",
  "23503",
  "23514",
  "22p02",
  "null value in column",
  "internal server error",
  "validation failed",
  "rpc error",
  "failed to parse",
  "json object",
  "econnrefused",
  "enotfound",
  "etimedout",
  "network error",
  "socket hang up",
  "axioserror",
  "request failed with status code",
  "unexpected token",
  "cannot read prop",
  "undefined is not",
  "jwt",
  "bearer ",
  "refresh_token",
  "access_token",
  "service_role",
  "anon key",
  "row-level security",
  "permission denied for",
  "invalid input syntax",
  "column ",
  " does not exist",
  "missing required",
  "ni payment",
  "sendgrid",
];

const ZOD_JARGON = /expected|received null|received undefined|invalid_type|invalid input/i;

const TECHNICAL_PHRASES = /\b(api|endpoint|database|db|sql|server error|status code|stack|exception|trace)\b/i;

/** English defaults when `t` is not passed (tests). */
const EN_STATUS: Record<number, string> = {
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to complete this action.",
  429: "Too many attempts. Please wait a moment and try again.",
  502: GENERIC_ERROR,
  503: "Service is temporarily unavailable. Please try again shortly.",
};

const I18N_STATUS: Record<number, string> = {
  401: "errors.sessionExpired",
  403: "errors.forbidden",
  429: "errors.tooManyAttempts",
  502: "errors.generic",
  503: "errors.unavailable",
};

const I18N_AUTH: Record<string, string> = {
  verification: "errors.verificationCode",
  session: "errors.sessionExpired",
  network: "errors.network",
};

function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field.replace(/_/g, " ");
}

function translate(t: ((key: string) => string) | undefined, key: string, en: string): string {
  if (!t) return en;
  const v = t(key);
  return v && v !== key ? v : en;
}

/** Turn raw API / Zod validation strings into short user-friendly copy. */
export function humanizeValidationMessage(input: string): string {
  const raw = input.replace(/\r?\n/g, " ").trim();
  if (!raw) return GENERIC_ERROR;

  const colonMatch = raw.match(/^(?:body\.)?([a-z_][a-z0-9_]*)\s*:\s*(.+)$/i);
  if (colonMatch) {
    const label = fieldLabel(colonMatch[1]);
    const detail = colonMatch[2].toLowerCase();
    if (detail.includes("null") || detail.includes("undefined")) {
      if (detail.includes("string")) return `${label} is required.`;
      if (detail.includes("number")) return `${label} must be a number.`;
      return `${label} is required.`;
    }
    if (detail.includes("email")) return "Please enter a valid email address.";
    if (detail.includes("too small") || detail.includes("at least")) {
      return `${label} is required.`;
    }
    if (!ZOD_JARGON.test(detail)) {
      return `${label}: ${colonMatch[2]}`;
    }
    return `${label} is invalid. Please check your entry.`;
  }

  if (ZOD_JARGON.test(raw)) {
    if (/phone/i.test(raw)) return "Phone number is required.";
    if (/first_name|first name/i.test(raw)) return "First name is required.";
    if (/last_name|last name/i.test(raw)) return "Last name is required.";
    if (/age/i.test(raw)) return "Please enter a valid age (13–120).";
    if (/email/i.test(raw)) return "Please enter a valid email address.";
    return "Please check your entries and try again.";
  }

  return raw;
}

function looksLikeInternalErrorMessage(text: string): boolean {
  if (!text || typeof text !== "string") return true;
  const lower = text.toLowerCase();
  if (INTERNAL_HINTS.some((h) => lower.includes(h))) return true;
  if (TECHNICAL_PHRASES.test(text)) return true;
  return false;
}

/** Map known auth / OTP wording before generic scrubbing. */
function mapKnownCustomerMessages(
  text: string,
  t?: (key: string) => string,
): string | null {
  const lower = text.toLowerCase();

  if (
    lower.includes("no longer available") ||
    lower.includes("seats_unavailable") ||
    lower.includes("seats unavailable")
  ) {
    return "One or more selected seats are no longer available. Please choose different seats.";
  }

  if (
    lower.includes("otp") ||
    lower.includes("verification code") ||
    (lower.includes("token") &&
      (lower.includes("invalid") ||
        lower.includes("expired") ||
        lower.includes("incorrect") ||
        lower.includes("wrong")))
  ) {
    return translate(t, I18N_AUTH.verification, "The code you entered is incorrect or has expired. Please try again or request a new code.");
  }

  if (
    lower.includes("jwt") ||
    lower.includes("session") && lower.includes("expired") ||
    lower.includes("not authenticated") ||
    lower.includes("unauthorized") ||
    (lower.includes("token") && (lower.includes("expired") || lower.includes("invalid")))
  ) {
    return translate(t, I18N_AUTH.session, EN_STATUS[401]);
  }

  if (lower.includes("network error") || lower.includes("failed to fetch")) {
    return translate(t, I18N_AUTH.network, "Connection problem. Check your internet and try again.");
  }

  if (lower.includes("rate limit") || lower.includes("too many")) {
    return translate(t, I18N_STATUS[429], EN_STATUS[429]);
  }

  return null;
}

function messageForHttpStatus(status: number, t?: (key: string) => string): string | null {
  const key = I18N_STATUS[status];
  if (!key) return null;
  return translate(t, key, EN_STATUS[status] ?? GENERIC_ERROR);
}

export function sanitizeUserFacingMessage(
  input: string | undefined | null,
  t?: (key: string) => string,
): string {
  if (input == null || typeof input !== "string") {
    return translate(t, "errors.generic", GENERIC_ERROR);
  }

  const known = mapKnownCustomerMessages(input, t);
  if (known) return known;

  const humanized = humanizeValidationMessage(input);
  const singleLine = humanized.trim().slice(0, 280);

  if (looksLikeInternalErrorMessage(singleLine)) {
    return translate(t, "errors.generic", GENERIC_ERROR);
  }
  if (ZOD_JARGON.test(singleLine)) {
    return humanizeValidationMessage(singleLine);
  }
  return singleLine;
}

function axiosApiErrorString(err: unknown): string | null {
  if (!axios.isAxiosError(err)) return null;
  const data = err.response?.data as { error?: string; message?: string } | undefined;
  const raw = data?.error ?? data?.message;
  return typeof raw === "string" ? raw : null;
}

function axiosStatus(err: unknown): number | undefined {
  if (!axios.isAxiosError(err)) return undefined;
  return err.response?.status;
}

function isNetworkAxiosError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  if (!err.response) return true;
  const code = (err as { code?: string }).code;
  return code === "ERR_NETWORK" || code === "ECONNABORTED";
}

/** Extract a display message from a failed fetch/axios response body. */
export function messageFromApiBody(
  body: unknown,
  fallback: string,
  t?: (key: string) => string,
): string {
  if (!body || typeof body !== "object") return fallback;
  const raw = (body as { error?: unknown; message?: unknown }).error
    ?? (body as { message?: unknown }).message;
  if (typeof raw !== "string" || !raw.trim()) return fallback;
  const s = sanitizeUserFacingMessage(raw, t);
  const generic = translate(t, "errors.generic", GENERIC_ERROR);
  return s === generic ? fallback : s;
}

/**
 * Safe message for toasts and inline errors.
 * Pass `t` from useLanguage() for translated status/auth fallbacks.
 */
export function getUserFacingErrorMessage(
  err: unknown,
  fallback: string,
  t?: (key: string) => string,
): string {
  const generic = translate(t, "errors.generic", GENERIC_ERROR);

  if (isNetworkAxiosError(err)) {
    return translate(t, I18N_AUTH.network, "Connection problem. Check your internet and try again.");
  }

  const ax = axiosApiErrorString(err);
  if (ax != null) {
    const known = mapKnownCustomerMessages(ax, t);
    if (known) return known;
    const s = sanitizeUserFacingMessage(ax, t);
    if (s !== generic) return s;
  }

  const status = axiosStatus(err);
  if (status) {
    const statusMsg = messageForHttpStatus(status, t);
    if (statusMsg && statusMsg !== generic) return statusMsg;
  }

  if (err instanceof Error) {
    const known = mapKnownCustomerMessages(err.message, t);
    if (known) return known;
    const s = sanitizeUserFacingMessage(err.message, t);
    if (s !== generic) return s;
  }

  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string") {
      const known = mapKnownCustomerMessages(m, t);
      if (known) return known;
      const s = sanitizeUserFacingMessage(m, t);
      if (s !== generic) return s;
    }
  }

  return fallback || generic;
}
