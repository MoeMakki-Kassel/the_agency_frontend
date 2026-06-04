import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../components/ui/utils';
import { formFieldDirProps } from '../utils/formFieldDir';
import { useAuth } from '../components/AuthProvider';
import { authFetch } from '../auth/authSession';
import { isProfileComplete } from '../utils/attendeeFormValidation';
import { getUserFacingErrorMessage, messageFromApiBody } from '../utils/userFacingError';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { setAuthSession } = useAuth();
  const from = location.state?.from?.pathname || '/';
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = email.trim().toLowerCase();

    try {
      if (!showVerification) {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(t('login.error.noAccount'));
          }
          if (response.status === 429) {
            throw new Error(
              messageFromApiBody(data, t('errors.tooManyAttempts'), t),
            );
          }
          throw new Error(messageFromApiBody(data, t('login.error.authGeneric'), t));
        }

        setShowVerification(true);
      } else {
        const response = await fetch(`${API_URL}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: loginEmail, token: verificationCode.trim() }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(messageFromApiBody(data, t('login.error.authGeneric'), t));
        }

        if (!data.session) {
          throw new Error(t('login.error.invalidSession'));
        }

        setAuthSession(data.session);

        try {
          const profileRes = await authFetch(`${API_URL}/users/me`, {
            headers: { 'Content-Type': 'application/json' },
          });
          const profile = await profileRes.json();
          if (profileRes.ok && !isProfileComplete(profile)) {
            navigate('/profile', { replace: true, state: { from: { pathname: from } } });
            return;
          }
        } catch {
          /* continue to original destination */
        }

        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      setError(getUserFacingErrorMessage(err, t('login.error.authGeneric'), t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 sm:p-8 border border-border">
        <Link
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} className="me-2" />
          {t('login.backToSite')}
        </Link>

        <h2 className="text-2xl sm:text-3xl font-bold font-['Tajawal'] text-ink-black mb-2">
          {t('login.welcomeBack')}
        </h2>
        <p className="text-mid-gray mb-6 sm:mb-8 text-sm sm:text-base">
          {t('login.signInDesc')}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-[#525252]/10 border border-[#525252]/20 rounded-lg text-[#525252] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-black mb-2">{t('login.email')}</label>
            <div className="relative">
              <Mail className="absolute start-3 top-1/2 -translate-y-1/2 text-warm-gray" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={showVerification}
                {...formFieldDirProps(
                  isRTL,
                  'latin',
                  'w-full ps-10 pe-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground disabled:opacity-60',
                )}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {showVerification && (
            <div>
              <label className="block text-sm font-medium text-ink-black mb-2">
                {t('login.verificationCode')}
              </label>
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
                    'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-input text-foreground font-mono tracking-widest text-2xl',
                    !isRTL && 'text-center',
                  ),
                )}
              />
              <p className="text-xs text-mid-gray mt-2">{t('login.verificationCodeDesc')}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-[#525252] transition-colors flex items-center justify-center mt-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showVerification ? (
              t('login.verifySignIn')
            ) : (
              t('login.sendCode')
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
