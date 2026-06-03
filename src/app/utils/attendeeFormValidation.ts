import type { SignupFormValues } from "../components/AuthSignupFields";
import { isValidFormNationalPhone, phoneFormToE164 } from "./phoneValidation";

export type AttendeeValidationResult =
  | { ok: true; phoneE164: string }
  | { ok: false; messageKey: string; phoneInvalid?: boolean };

export function validateAttendeeForm(
  values: SignupFormValues,
  options: { requireEmail?: boolean } = {},
): AttendeeValidationResult {
  const requireEmail = options.requireEmail !== false;

  if (!values.firstName.trim()) {
    return { ok: false, messageKey: "validation.firstNameRequired" };
  }
  if (!values.lastName.trim()) {
    return { ok: false, messageKey: "validation.lastNameRequired" };
  }
  if (requireEmail && !values.email.trim()) {
    return { ok: false, messageKey: "validation.emailRequired" };
  }
  if (!values.phoneNational.trim()) {
    return { ok: false, messageKey: "validation.phoneRequired", phoneInvalid: true };
  }
  if (!isValidFormNationalPhone(values.phoneCountryIso, values.phoneNational)) {
    return { ok: false, messageKey: "validation.phoneNationalInvalid", phoneInvalid: true };
  }
  const phoneE164 = phoneFormToE164(values.phoneCountryIso, values.phoneNational);
  if (!phoneE164) {
    return { ok: false, messageKey: "validation.phoneNationalInvalid", phoneInvalid: true };
  }
  const ageNum = Number(values.age);
  if (!values.age.trim() || Number.isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
    return { ok: false, messageKey: "validation.ageRequired" };
  }

  return { ok: true, phoneE164 };
}

export type UserProfileRow = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
};

export function isProfileComplete(profile: UserProfileRow): boolean {
  return Boolean(
    profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.phone?.trim() &&
      profile.age != null &&
      profile.age >= 13,
  );
}
