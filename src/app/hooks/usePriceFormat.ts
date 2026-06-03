import { useLanguage } from "../contexts/LanguageContext";
import {
  formatDecimal,
  formatDiscountAmount,
  formatPriceFrom,
  formatPriceWithCurrency,
} from "../utils/localeFormat";
import { useAppLocale } from "./useAppLocale";

/** Price / amount formatting aligned with current language and RTL-safe labels. */
export function usePriceFormat() {
  const locale = useAppLocale();
  const { t } = useLanguage();
  const currencyLabel = t("events.currencyJod");
  const fromLabel = t("events.from");

  return {
    locale,
    currencyLabel,
    formatPrice: (amount: number) =>
      formatPriceWithCurrency(amount, locale, currencyLabel),
    formatFromPrice: (amount: number) =>
      formatPriceFrom(amount, locale, fromLabel, currencyLabel),
    formatDiscount: (amount: number) =>
      formatDiscountAmount(amount, locale, currencyLabel),
    formatDecimal: (n: number, options?: Intl.NumberFormatOptions) =>
      formatDecimal(n, locale, options),
  };
}
