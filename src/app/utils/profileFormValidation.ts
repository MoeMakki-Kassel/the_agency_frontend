import {
  isValidFormNationalPhone,
  phoneFormToE164,
} from "./phoneValidation";

export type ProfileFormValues = {
  first_name: string;
  last_name: string;
  phoneCountryIso: string;
  phoneNational: string;
  age: string;
};

export type ProfileFieldErrors = Partial<
  Record<keyof ProfileFormValues | "phone", string>
>;

export type ProfileValidationResult =
  | { ok: true; phoneE164: string | null }
  | { ok: false; errors: ProfileFieldErrors; messageKey?: string };

export function validateProfileForm(
  values: ProfileFormValues,
  messageFor: (key: string) => string,
): ProfileValidationResult {
  const errors: ProfileFieldErrors = {};

  if (!values.first_name.trim()) {
    errors.first_name = messageFor("validation.firstNameRequired");
  }
  if (!values.last_name.trim()) {
    errors.last_name = messageFor("validation.lastNameRequired");
  }

  const nationalTrimmed = values.phoneNational.trim();
  let phoneE164: string | null = null;
  if (!nationalTrimmed) {
    errors.phone = messageFor("validation.phoneRequired");
  } else if (!isValidFormNationalPhone(values.phoneCountryIso, nationalTrimmed)) {
    errors.phone = messageFor("validation.phoneNationalInvalid");
  } else {
    phoneE164 = phoneFormToE164(values.phoneCountryIso, nationalTrimmed) || null;
    if (!phoneE164) {
      errors.phone = messageFor("validation.phoneNationalInvalid");
    }
  }

  const ageNum = Number(values.age);
  if (!values.age.trim() || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
    errors.age = messageFor("validation.ageRequired");
  }

  if (Object.keys(errors).length > 0) {
    const first = errors.first_name ?? errors.last_name ?? errors.phone ?? errors.age;
    return { ok: false, errors, messageKey: first };
  }

  return { ok: true, phoneE164 };
}
