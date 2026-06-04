import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, Mail, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';
import { useLanguage } from '../contexts/LanguageContext';
import { FloorMapSeatPicker, SelectedSeatInfo } from './FloorMapSeatPicker';
import { AuthSignupFields, SignupFormValues } from './AuthSignupFields';
import { parseE164ToForm } from '../utils/phoneValidation';
import {
  isProfileComplete,
  validateAttendeeForm,
  type UserProfileRow,
} from '../utils/attendeeFormValidation';
import { authFetch } from '../auth/authSession';
import { getUserFacingErrorMessage, messageFromApiBody } from '../utils/userFacingError';
import { formFieldDirProps } from '../utils/formFieldDir';
import { usePriceFormat } from '../hooks/usePriceFormat';
import { cn } from './ui/utils';

const API_URL = import.meta.env.VITE_API_URL;

export type BookingStep = 'seats' | 'signup' | 'verify' | 'details' | 'checkout';

interface EventTier {
  id: string;
  name: string;
  price: number;
  description?: string;
  selection_mode?: 'assigned' | 'general_admission';
  venue_tier_key?: string;
}

interface BookingWizardProps {
  event: {
    id: string;
    title: string;
    max_tickets_per_order?: number | null;
    venue_template_id?: string | null;
    tiers: EventTier[];
  };
  onClose: () => void;
}

const RESEND_COOLDOWN_SEC = 60;

function apiErrorText(
  data: Record<string, unknown> | null | undefined,
  fallback: string,
  t: (key: string) => string,
): string {
  return messageFromApiBody(data, fallback, t);
}

/** Supabase uses "already been registered"; Postgres uses 409 / duplicate key. */
function isDuplicateEmailSignup(
  status: number,
  message?: string,
  code?: string,
): boolean {
  const c = (code ?? '').toLowerCase();
  if (c === 'email_exists' || c === 'user_already_exists') return true;
  if (status === 409) return true;
  const m = (message ?? '').toLowerCase();
  return (
    m.includes('already been registered') ||
    m.includes('email address has already') ||
    m.includes('email already exists') ||
    m.includes('already registered') ||
    m.includes('already exists') ||
    m.includes('duplicate')
  );
}

function profileToSignupValues(
  profile: UserProfileRow,
  fallback: SignupFormValues,
): SignupFormValues {
  const parsed = parseE164ToForm(profile.phone);
  return {
    firstName: profile.first_name?.trim() || fallback.firstName,
    lastName: profile.last_name?.trim() || fallback.lastName,
    email: profile.email?.trim() || fallback.email,
    phoneCountryIso: parsed.phoneCountryIso,
    phoneNational: parsed.phoneNational || fallback.phoneNational,
    age: profile.age != null ? String(profile.age) : fallback.age,
  };
}

export function BookingWizard({ event, onClose }: BookingWizardProps) {
  const { session, setAuthSession, refreshProfile } = useAuth();
  const { t, isRTL } = useLanguage();
  const { formatPrice, formatDiscount } = usePriceFormat();
  const isLoggedIn = Boolean(session?.access_token);

  const [step, setStep] = useState<BookingStep>('seats');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [postVerifyNeedsDetails, setPostVerifyNeedsDetails] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatInfo[]>([]);
  const [signupValues, setSignupValues] = useState<SignupFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phoneCountryIso: 'JO',
    phoneNational: '',
    age: '',
  });
  const [signinEmail, setSigninEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [paymentReservationId, setPaymentReservationId] = useState('');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [checkoutPricing, setCheckoutPricing] = useState<{
    subtotal: number;
    discount: number;
    total: number;
  } | null>(null);

  const pendingReservationIdsRef = useRef<string[]>([]);
  const confirmedSeatsRef = useRef<SelectedSeatInfo[]>([]);

  const steps = useMemo((): BookingStep[] => {
    if (isLoggedIn) return ['seats', 'details', 'checkout'];
    const guest: BookingStep[] = ['seats', 'signup', 'verify'];
    if (authMode === 'signin' || postVerifyNeedsDetails) guest.push('details');
    guest.push('checkout');
    return guest;
  }, [isLoggedIn, authMode, postVerifyNeedsDetails]);

  const bookingTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const displaySubtotal = checkoutPricing?.subtotal ?? bookingTotal;
  const displayDiscount = checkoutPricing?.discount ?? 0;
  const displayTotal = checkoutPricing?.total ?? bookingTotal;
  const stepIndex = steps.indexOf(step);

  const detailsEmailLocked = isLoggedIn || authMode === 'signin';

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (step !== 'details' || !session?.access_token) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      try {
        const res = await authFetch(`${API_URL}/users/me`, {
          headers: { 'Content-Type': 'application/json' },
        });
        const data = (await res.json()) as UserProfileRow & { error?: string };
        if (!res.ok || cancelled) return;
        setSignupValues((v) =>
          profileToSignupValues(data, {
            ...v,
            email:
              data.email?.trim() ||
              v.email ||
              signinEmail ||
              session.user?.email ||
              '',
          }),
        );
      } catch {
        /* keep form as-is */
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, session?.access_token, signinEmail, session?.user?.email]);

  const cancelPendingReservations = useCallback(async () => {
    const ids = [...pendingReservationIdsRef.current];
    if (ids.length === 0) return;
    const token = session?.access_token;
    if (!token) {
      pendingReservationIdsRef.current = [];
      return;
    }
    await Promise.all(
      ids.map((id) =>
        axios
          .post(`${API_URL}/reservations/${id}/cancel`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => {}),
      ),
    );
    pendingReservationIdsRef.current = [];
  }, [session?.access_token]);

  const handleClose = async () => {
    await cancelPendingReservations();
    onClose();
  };

  const createReservation = async (token: string, seats: SelectedSeatInfo[]) => {
    if (seats.length < 1) {
      throw new Error(t('booking.selectSeatsToContinue'));
    }
    const res = await axios.post(
      `${API_URL}/reservations`,
      {
        event_id: event.id,
        seats: seats.map((s) => ({ seat_id: s.seat_id })),
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const reservation = res.data as {
      id?: string;
      total_amount?: number;
      subtotal_amount?: number | null;
      discount_amount?: number;
    };
    if (!reservation?.id) {
      throw new Error(t('checkout.reservationFailed'));
    }
    pendingReservationIdsRef.current = [reservation.id];
    setPaymentReservationId(reservation.id);
    const subtotal = Number(reservation.subtotal_amount ?? reservation.total_amount ?? bookingTotal);
    const discount = Number(reservation.discount_amount ?? 0);
    const total = Number(reservation.total_amount ?? bookingTotal);
    setCheckoutPricing({ subtotal, discount, total });
    setAppliedPromoCode(null);
    setPromoInput('');
    setStep('checkout');
  };

  const syncPricingFromPromoResponse = (data: {
    subtotal_amount?: number;
    discount_amount?: number;
    total_amount?: number;
    promo_code?: string | null;
    discount_percent?: number;
  }) => {
    setCheckoutPricing({
      subtotal: Number(data.subtotal_amount ?? 0),
      discount: Number(data.discount_amount ?? 0),
      total: Number(data.total_amount ?? 0),
    });
    setAppliedPromoCode(data.promo_code ?? null);
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code || !paymentReservationId || !session?.access_token) return;
    setPromoLoading(true);
    setPaymentError(null);
    try {
      const res = await axios.post(
        `${API_URL}/reservations/${paymentReservationId}/apply-promo`,
        { code },
        { headers: { Authorization: `Bearer ${session.access_token}` } },
      );
      syncPricingFromPromoResponse(res.data);
      setPromoInput('');
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err, t('checkout.promoInvalid'), t);
      setPaymentError(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    if (!paymentReservationId || !session?.access_token) return;
    setPromoLoading(true);
    setPaymentError(null);
    try {
      const res = await axios.delete(`${API_URL}/reservations/${paymentReservationId}/promo`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      syncPricingFromPromoResponse(res.data);
      setAppliedPromoCode(null);
      setPromoInput('');
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err, t('checkout.promoInvalid'), t);
      setPaymentError(msg);
    } finally {
      setPromoLoading(false);
    }
  };

  const afterSeatsConfirmed = (seats: SelectedSeatInfo[]) => {
    setSelectedSeats(seats);
    confirmedSeatsRef.current = seats;
    if (isLoggedIn) {
      setStep('details');
      setError(null);
    } else {
      setStep('signup');
      setAuthMode('signup');
    }
  };

  const requestLoginOtp = async (email: string) => {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      throw new Error(apiErrorText(loginData, t('login.error.authGeneric'), t));
    }
  };

  const saveProfile = async (phoneE164: string) => {
    const email = (detailsEmailLocked
      ? signupValues.email || signinEmail
      : signupValues.email
    )
      .trim()
      .toLowerCase();
    const res = await authFetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: signupValues.firstName.trim(),
        last_name: signupValues.lastName.trim(),
        phone: phoneE164,
        age: Number(signupValues.age),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(messageFromApiBody(data, t('profile.saveError'), t));
    }
    if (!detailsEmailLocked && email) {
      setSignupValues((v) => ({ ...v, email }));
    }
    return data as UserProfileRow;
  };

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token) {
      setError(t('login.error.authGeneric'));
      return;
    }

    const validated = validateAttendeeForm(signupValues, {
      requireEmail: !detailsEmailLocked,
    });
    if (!validated.ok) {
      setPhoneInvalid(Boolean(validated.phoneInvalid));
      toast.error(t(validated.messageKey));
      return;
    }
    setPhoneInvalid(false);
    setLoading(true);
    setError(null);
    try {
      await saveProfile(validated.phoneE164);
      await refreshProfile();
      if (!paymentReservationId) {
        const seatsForReservation =
          confirmedSeatsRef.current.length > 0 ? confirmedSeatsRef.current : selectedSeats;
        await createReservation(token, seatsForReservation);
      } else {
        setStep('checkout');
      }
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err, t('profile.saveError'), t);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    const validated = validateAttendeeForm(signupValues);
    if (!validated.ok) {
      setPhoneInvalid(Boolean(validated.phoneInvalid));
      toast.error(t(validated.messageKey));
      setLoading(false);
      return;
    }
    setPhoneInvalid(false);

    const email = signupValues.email.trim().toLowerCase();

    try {
      const payload: Record<string, string | number> = {
        first_name: signupValues.firstName.trim(),
        last_name: signupValues.lastName.trim(),
        email,
        phone: validated.phoneE164,
        age: Number(signupValues.age),
      };

      const signupRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const signupData = (await signupRes.json()) as Record<string, unknown>;
      const signupErr = apiErrorText(signupData, t('login.error.signUpFailed'), t);
      const signupCode =
        typeof signupData.code === 'string'
          ? signupData.code
          : typeof signupData.error_code === 'string'
            ? signupData.error_code
            : undefined;
      if (!signupRes.ok) {
        if (isDuplicateEmailSignup(signupRes.status, signupErr, signupCode)) {
          setError(null);
          setInfo(t('booking.emailExistsVerify'));
          await requestLoginOtp(email);
          setSigninEmail(email);
          setAuthMode('signin');
          setResendSeconds(RESEND_COOLDOWN_SEC);
          setStep('verify');
          return;
        }
        throw new Error(signupErr || t('login.error.signUpFailed'));
      }

      await requestLoginOtp(email);
      setResendSeconds(RESEND_COOLDOWN_SEC);
      setStep('verify');
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t('login.error.authGeneric'), t));
    } finally {
      setLoading(false);
    }
  };

  const sendSigninCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const email = signinEmail.trim().toLowerCase();
    try {
      await requestLoginOtp(email);
      setSignupValues((v) => ({ ...v, email }));
      setResendSeconds(RESEND_COOLDOWN_SEC);
      setStep('verify');
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t('login.error.authGeneric'), t));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSeconds > 0 || loading) return;
    const email = (authMode === 'signin' ? signinEmail : signupValues.email).trim().toLowerCase();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await requestLoginOtp(email);
      setResendSeconds(RESEND_COOLDOWN_SEC);
      setInfo(t('checkout.verificationDesc'));
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t('login.error.authGeneric'), t));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const email = (authMode === 'signin' ? signinEmail : signupValues.email).trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: verificationCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(messageFromApiBody(data, t('login.error.authGeneric'), t));
      if (!data.session) throw new Error(t('login.error.invalidSession'));

      setAuthSession(data.session);
      const token = data.session.access_token as string;

      if (authMode === 'signin') {
        setPostVerifyNeedsDetails(false);
        setStep('details');
        return;
      }

      const profileRes = await authFetch(`${API_URL}/users/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const profile = (await profileRes.json()) as UserProfileRow;
      if (!profileRes.ok) {
        throw new Error(
          messageFromApiBody(profile as Record<string, unknown>, t('login.error.authGeneric'), t),
        );
      }

      if (isProfileComplete(profile)) {
        const seatsForReservation =
          confirmedSeatsRef.current.length > 0 ? confirmedSeatsRef.current : selectedSeats;
        await createReservation(token, seatsForReservation);
      } else {
        setSignupValues((v) => profileToSignupValues(profile, { ...v, email }));
        setPostVerifyNeedsDetails(true);
        setStep('details');
      }
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t('login.error.authGeneric'), t));
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setIsPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await axios.post(
        `${API_URL}/ni-payments/initiate`,
        { reservation_id: paymentReservationId },
        { headers: { Authorization: `Bearer ${session?.access_token}` } },
      );
      const { payment_url, free_checkout } = res.data as { payment_url?: string; free_checkout?: boolean };
      if (!payment_url) throw new Error(t('checkout.paymentFailed'));
      window.location.href = payment_url;
      if (free_checkout) return;
    } catch (err: unknown) {
      const msg = getUserFacingErrorMessage(err, t('checkout.paymentFailed'), t);
      setPaymentError(msg);
      toast.error(msg);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const goBack = useCallback(async () => {
    if (step === 'seats' || loading) return;
    setError(null);
    setInfo(null);
    if (step === 'checkout') {
      await cancelPendingReservations();
      setPaymentReservationId('');
      setCheckoutPricing(null);
      setAppliedPromoCode(null);
      setPromoInput('');
      if (steps.includes('details')) {
        setStep('details');
      } else {
        setStep('signup');
      }
      return;
    }
    if (step === 'details') {
      setStep(isLoggedIn ? 'seats' : 'verify');
      return;
    }
    if (step === 'verify') {
      setStep('signup');
      setVerificationCode('');
      return;
    }
    if (step === 'signup') {
      setStep('seats');
    }
  }, [step, loading, cancelPendingReservations, isLoggedIn, steps]);

  const stepLabel = (s: BookingStep) => {
    switch (s) {
      case 'seats':
        return t('booking.step.seats');
      case 'signup':
        return authMode === 'signin' ? t('login.signIn') : t('booking.step.details');
      case 'details':
        return t('booking.step.details');
      case 'verify':
        return t('booking.step.verify');
      case 'checkout':
        return t('booking.step.payment');
      default:
        return s;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 scaled-laptop:p-0 cramped:p-0">
      <div className="bg-card text-card-foreground rounded-t-3xl sm:rounded-2xl w-full sm:max-w-4xl h-[min(95dvh,100dvh)] sm:h-[min(90dvh,960px)] scaled-laptop:h-[min(98dvh,100dvh)] scaled-laptop:max-h-[100dvh] scaled-laptop:rounded-none cramped:h-[100dvh] cramped:max-h-[100dvh] cramped:rounded-none overflow-hidden flex flex-col shadow-2xl">
        <div className="p-4 sm:p-6 short:p-3 scaled-laptop:p-2.5 cramped:p-2 border-b border-border bg-card shrink-0">
          <div className="flex justify-between items-start mb-4 short:mb-2 scaled-laptop:mb-2 cramped:mb-1.5 gap-2">
            <div className="flex items-start gap-1 min-w-0 flex-1">
              {step !== 'seats' && (
                <button
                  type="button"
                  onClick={() => void goBack()}
                  disabled={loading}
                  className="p-2 hover:bg-muted rounded-lg shrink-0 disabled:opacity-50"
                  aria-label={t('common.back')}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-xl text-foreground truncate scaled-laptop:text-base cramped:text-sm">{event.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground short:hidden">{t('booking.title')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg shrink-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 scaled-laptop:pb-0.5 cramped:pb-0">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && (
                  <span className="text-muted-foreground text-xs shrink-0 scaled-laptop:hidden cramped:hidden">
                    →
                  </span>
                )}
                <span
                  className={cn(
                    'text-xs sm:text-sm px-2 py-1 rounded-full font-medium whitespace-nowrap shrink-0 scaled-laptop:text-[11px] scaled-laptop:px-1.5 scaled-laptop:py-0.5 cramped:text-[10px] cramped:px-1.5 cramped:py-0.5',
                    step === s
                      ? 'bg-primary text-primary-foreground'
                      : stepIndex > i
                        ? 'bg-muted text-foreground'
                        : 'bg-card border border-border text-muted-foreground',
                  )}
                >
                  {stepLabel(s)}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'flex-1 min-h-0',
            step === 'seats'
              ? 'overflow-hidden flex flex-col p-0 sm:p-4 short:sm:p-3 scaled-laptop:p-0 cramped:p-0'
              : 'overflow-y-auto p-4 sm:p-6',
          )}
        >
          {step !== 'seats' && info && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
              {info}
            </div>
          )}
          {step !== 'seats' && error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 'seats' && (
            <div className="flex flex-col min-h-0 flex-1 h-full">
              <FloorMapSeatPicker
                eventId={event.id}
                venueTemplateId={event.venue_template_id}
                tiers={event.tiers}
                maxTicketsPerOrder={event.max_tickets_per_order}
                onConfirm={afterSeatsConfirmed}
              />
            </div>
          )}

          {step === 'signup' && (
            <div className="max-w-md mx-auto">
              <h4 className="text-xl font-bold font-['Tajawal'] mb-2">{t('checkout.attendeeInfo')}</h4>
              <p className="text-sm text-muted-foreground mb-6">{t('booking.signUpDesc')}</p>

              {authMode === 'signup' ? (
                <form onSubmit={submitSignup} className="space-y-4">
                  <AuthSignupFields
                    values={signupValues}
                    onChange={(patch) => {
                      setPhoneInvalid(false);
                      setSignupValues((v) => ({ ...v, ...patch }));
                    }}
                    phoneRequired
                    phoneInvalid={phoneInvalid}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent disabled:opacity-70 flex justify-center"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {info ? t('booking.sendingSignInCode') : null}
                      </span>
                    ) : (
                      t('checkout.continue')
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={sendSigninCode} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('login.email')}
                      <span className="text-red-600 ms-1">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-warm-gray" size={18} />
                      <input
                        type="email"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        required
                        {...formFieldDirProps(
                          isRTL,
                          'latin',
                          'w-full ps-10 pe-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50',
                        )}
                        placeholder={t('login.emailPlaceholder')}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent disabled:opacity-70 flex justify-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('login.sendCode')}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {authMode === 'signup' ? t('login.haveAccount') : t('login.noAccount')}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                    setError(null);
                    setInfo(null);
                    setPostVerifyNeedsDetails(false);
                  }}
                  className="ms-2 font-medium text-foreground hover:underline"
                >
                  {authMode === 'signup' ? t('nav.signIn') : t('booking.createAccount')}
                </button>
              </p>
            </div>
          )}

          {step === 'details' && (
            <div className="max-w-md mx-auto">
              <h4 className="text-xl font-bold font-['Tajawal'] mb-2">{t('checkout.attendeeInfo')}</h4>
              <p className="text-sm text-muted-foreground mb-6">{t('booking.detailsDesc')}</p>
              {profileLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <form onSubmit={submitDetails} className="space-y-4">
                  <AuthSignupFields
                    values={signupValues}
                    onChange={(patch) => {
                      setPhoneInvalid(false);
                      setSignupValues((v) => ({ ...v, ...patch }));
                    }}
                    emailDisabled={detailsEmailLocked}
                    phoneRequired
                    phoneInvalid={phoneInvalid}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent disabled:opacity-70 flex justify-center"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t('checkout.continue')
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {step === 'verify' && (
            <div className="max-w-md mx-auto">
              <h4 className="text-xl font-bold font-['Tajawal'] mb-2">{t('checkout.verification')}</h4>
              <p className="text-sm text-muted-foreground mb-6">{t('checkout.verificationDesc')}</p>
              <form onSubmit={verifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('checkout.enterCode')}</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    maxLength={8}
                    placeholder="000000"
                    {...formFieldDirProps(
                      isRTL,
                      'latin',
                      cn(
                        'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono tracking-widest text-2xl',
                        !isRTL && 'text-center',
                      ),
                    )}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent disabled:opacity-70 flex justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('checkout.verify')}
                </button>
                <button
                  type="button"
                  onClick={() => void handleResendCode()}
                  disabled={loading || resendSeconds > 0}
                  className="w-full py-2 text-sm font-medium text-[#525252] hover:text-foreground disabled:opacity-50"
                >
                  {resendSeconds > 0
                    ? t('booking.resendCooldown').replace('{seconds}', String(resendSeconds))
                    : t('booking.resendCode')}
                </button>
              </form>
            </div>
          )}

          {step === 'checkout' && (
            <div className="max-w-lg mx-auto space-y-6">
              <h4 className="text-xl font-bold">{t('checkout.payment')}</h4>
              <p className="text-sm text-muted-foreground">
                {event.title} • {selectedSeats.length} seat(s)
              </p>
              <div className="space-y-3">
                <label className="block text-sm font-medium">{t('checkout.promoCode')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    disabled={promoLoading || Boolean(appliedPromoCode)}
                    placeholder="SUMMER20"
                    className="flex-1 px-4 py-3 rounded-lg border border-border font-mono uppercase disabled:bg-[#f5f5f5]"
                  />
                  {appliedPromoCode ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      disabled={promoLoading}
                      className="px-4 py-3 border border-border rounded-lg text-sm font-medium hover:bg-[#f5f5f5] disabled:opacity-70"
                    >
                      {t('checkout.promoRemove')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-70 min-w-[5rem] flex justify-center"
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('checkout.promoApply')}
                    </button>
                  )}
                </div>
                {appliedPromoCode && (
                  <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2 font-mono">
                    {appliedPromoCode}
                  </p>
                )}
              </div>
              <div className="bg-[#f5f5f5] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.subtotal')}</span>
                  <span>{formatPrice(displaySubtotal)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>{t('checkout.discount')}</span>
                    <span>{formatDiscount(displayDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('checkout.tax')}</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                  <span>{t('checkout.total')}</span>
                  <span>{formatPrice(displayTotal)}</span>
                </div>
              </div>
              {paymentError && <p className="text-red-500 text-sm">{paymentError}</p>}
              <button
                type="button"
                onClick={handlePay}
                disabled={isPaymentLoading || promoLoading}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-accent disabled:opacity-60"
              >
                {isPaymentLoading ? 'Redirecting to payment…' : t('checkout.pay')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
