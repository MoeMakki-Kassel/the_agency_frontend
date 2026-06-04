import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formFieldDirProps } from '../utils/formFieldDir';
import { PhoneCountryField } from './PhoneCountryField';
import { getCountryByIso, COUNTRY_DIAL_CODES } from '../data/countryDialCodes';

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryIso: string;
  phoneNational: string;
  age: string;
}

interface AuthSignupFieldsProps {
  values: SignupFormValues;
  onChange: (patch: Partial<SignupFormValues>) => void;
  emailDisabled?: boolean;
  phoneRequired?: boolean;
  phoneInvalid?: boolean;
}

function RequiredMark() {
  return <span className="text-red-600 ms-1" aria-hidden="true">*</span>;
}

export function AuthSignupFields({ values, onChange, emailDisabled, phoneRequired, phoneInvalid }: AuthSignupFieldsProps) {
  const { t, isRTL } = useLanguage();
  const phoneRequiredField = phoneRequired !== false;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">
          {t('login.firstName')}
          <RequiredMark />
        </label>
        <input
          type="text"
          value={values.firstName}
          onChange={(e) => onChange({ firstName: e.target.value })}
          required
          placeholder={t('login.firstNamePlaceholder')}
          {...formFieldDirProps(isRTL, 'text', 'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">
          {t('login.lastName')}
          <RequiredMark />
        </label>
        <input
          type="text"
          value={values.lastName}
          onChange={(e) => onChange({ lastName: e.target.value })}
          required
          placeholder={t('login.lastNamePlaceholder')}
          {...formFieldDirProps(isRTL, 'text', 'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">
          {t('login.email')}
          <RequiredMark />
        </label>
        <input
          type="email"
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
          required
          disabled={emailDisabled}
          placeholder={t('login.emailPlaceholder')}
          {...formFieldDirProps(
            isRTL,
            'latin',
            'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground disabled:opacity-60',
          )}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">
          {t('login.phone')}
          {phoneRequiredField && <RequiredMark />}
        </label>
        <PhoneCountryField
          country={getCountryByIso(values.phoneCountryIso) ?? COUNTRY_DIAL_CODES[0]}
          onCountryChange={(iso) => onChange({ phoneCountryIso: iso })}
          nationalNumber={values.phoneNational}
          onNationalNumberChange={(n) => onChange({ phoneNational: n })}
          nationalPlaceholder={t('validation.phoneNationalPlaceholder')}
          required={phoneRequiredField}
          invalid={phoneInvalid}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-black mb-2">
          {t('login.age')}
          <RequiredMark />
        </label>
        <input
          type="number"
          value={values.age}
          onChange={(e) => onChange({ age: e.target.value })}
          required
          min="13"
          max="120"
          placeholder={t('login.agePlaceholder')}
          {...formFieldDirProps(
            isRTL,
            'latin',
            'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground',
          )}
        />
      </div>
    </>
  );
}
