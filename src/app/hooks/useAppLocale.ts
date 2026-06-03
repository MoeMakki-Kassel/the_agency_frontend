import { useLanguage } from "../contexts/LanguageContext";
import type { Language } from "../contexts/LanguageContext";

/** BCP 47 locale for dates/times aligned with site language (EN / AR). */
export function useAppLocale(): string {
  const { language } = useLanguage();
  return language === "AR" ? "ar-JO" : "en-JO";
}

export function localeFromLanguage(language: Language): string {
  return language === "AR" ? "ar-JO" : "en-JO";
}

/** Date/time + number/price formatters bound to current site language. */
export function useLocaleFormat() {
  const locale = useAppLocale();
  const { language } = useLanguage();
  return { locale, language };
}

/** Event times are shown in Jordan regardless of the visitor's device timezone. */
export const EVENT_DISPLAY_TIME_ZONE = "Asia/Amman";

export function formatEventDateTime(
  iso: string | undefined | null,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(locale, {
    timeZone: EVENT_DISPLAY_TIME_ZONE,
    ...options,
  });
}

function calendarDayKey(iso: string, timeZone: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", { timeZone });
}

export function formatEventDateTimeRange(
  startIso: string | undefined | null,
  endIso: string | undefined | null,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!startIso) return "";
  const startDate = new Date(startIso);
  if (Number.isNaN(startDate.getTime())) return "";

  if (!endIso) {
    return formatEventDateTime(startIso, locale, options);
  }

  const endDate = new Date(endIso);
  if (Number.isNaN(endDate.getTime())) {
    return formatEventDateTime(startIso, locale, options);
  }

  const sameDay =
    calendarDayKey(startIso, EVENT_DISPLAY_TIME_ZONE) ===
    calendarDayKey(endIso, EVENT_DISPLAY_TIME_ZONE);

  if (sameDay) {
    const dateFmt = new Intl.DateTimeFormat(locale, {
      timeZone: EVENT_DISPLAY_TIME_ZONE,
      dateStyle: options?.dateStyle ?? "medium",
    });
    const timeFmt = new Intl.DateTimeFormat(locale, {
      timeZone: EVENT_DISPLAY_TIME_ZONE,
      timeStyle: options?.timeStyle ?? "short",
    });
    return `${dateFmt.format(startDate)}, ${timeFmt.format(startDate)} – ${timeFmt.format(endDate)}`;
  }

  const start = formatEventDateTime(startIso, locale, options);
  const end = formatEventDateTime(endIso, locale, options);
  return `${start} – ${end}`;
}

export function interpolateTemplate(
  template: string,
  vars: Record<string, string | number>,
  options?: { locale?: string },
): string {
  const locale = options?.locale;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key];
    if (v === undefined || v === null) return "";
    if (typeof v === "number" && locale) {
      return new Intl.NumberFormat(locale).format(v);
    }
    return String(v);
  });
}
