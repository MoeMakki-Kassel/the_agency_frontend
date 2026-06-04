import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import { COUNTRY_DIAL_CODES, type CountryDial } from "../data/countryDialCodes";
import { countryNameForLocale } from "../data/countryNamesAr";
import { CountryFlagGlyph } from "./CountryFlagGlyph";
import { useLanguage } from "../contexts/LanguageContext";
import { formFieldDirProps } from "../utils/formFieldDir";
import { maxNationalDigits, sanitizeNationalDigits } from "../utils/phoneValidation";
import { BidiLtr } from "./BidiLtr";

type PhoneCountryFieldProps = {
  country: CountryDial;
  onCountryChange: (iso2: string) => void;
  nationalNumber: string;
  onNationalNumberChange: (digits: string) => void;
  nationalPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Set after failed submit to highlight invalid national length */
  invalid?: boolean;
};

export function PhoneCountryField({
  country,
  onCountryChange,
  nationalNumber,
  onNationalNumberChange,
  nationalPlaceholder,
  disabled,
  required,
  invalid,
}: PhoneCountryFieldProps) {
  const { isRTL, language } = useLanguage();
  const maxLen = maxNationalDigits(country.iso2);
  const fdTel = formFieldDirProps(
    isRTL,
    "latin",
    `box-border h-12 min-h-12 w-full min-w-0 max-w-full flex-1 rounded-lg border bg-input px-3 text-sm leading-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-60 ${
      invalid ? "border-red-500 focus:ring-red-500/40" : "border-border"
    }`,
  );

  /** No SelectValue here: shared SelectTrigger styles force `select-value` to display:flex, which breaks sr-only and duplicates label + dial next to our custom row. */
  return (
    <div
      className={`flex w-full min-w-0 max-w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 ${
        isRTL ? "sm:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full shrink-0 sm:w-[8.75rem]">
      <Select
        value={country.iso2}
        onValueChange={onCountryChange}
        disabled={disabled}
      >
        <SelectTrigger
          type="button"
          aria-label={`${countryNameForLocale(country.iso2, country.name, language)}, +${country.dial}`}
          dir="ltr"
          className="h-12 min-h-12 w-full rounded-lg border border-border bg-input text-foreground px-2.5 text-sm shadow-none focus:ring-2 focus:ring-primary/50 focus:border-primary data-[size=default]:h-12 text-start"
        >
          <div className="flex min-w-0 items-center gap-1.5">
            <CountryFlagGlyph iso2={country.iso2} className="h-[1.125rem] w-[1.6875rem] shrink-0" />
            <BidiLtr className="font-medium text-ink-black">
              +{country.dial}
            </BidiLtr>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-72 z-[100] bg-popover text-popover-foreground border border-border" dir={isRTL ? "rtl" : "ltr"}>
          {COUNTRY_DIAL_CODES.map((c) => {
            const displayName = countryNameForLocale(c.iso2, c.name, language);
            return (
              <SelectItem
                key={c.iso2}
                value={c.iso2}
                textValue={`${c.iso2} ${displayName} +${c.dial}`}
                className="cursor-pointer"
              >
                <span className={`flex items-center gap-2.5 py-0.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <CountryFlagGlyph iso2={c.iso2} className="shrink-0" />
                  <BidiLtr className="font-medium text-foreground shrink-0">
                    +{c.dial}
                  </BidiLtr>
                  <span className="text-mid-gray truncate text-xs sm:text-sm text-start">
                    {displayName}
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      </div>

      <input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        required={required}
        maxLength={maxLen}
        aria-invalid={invalid || undefined}
        value={nationalNumber}
        onChange={(e) => {
          onNationalNumberChange(sanitizeNationalDigits(e.target.value, country.iso2));
        }}
        className={fdTel.className}
        dir={fdTel.dir}
        placeholder={nationalPlaceholder ?? "0791234567"}
      />
    </div>
  );
}
