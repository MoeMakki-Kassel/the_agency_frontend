import { Mail, Phone, MapPin, MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { getUserFacingErrorMessage } from "../utils/userFacingError";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { formFieldDirProps } from "../utils/formFieldDir";
import { formatLabeledPhone } from "../utils/localeFormat";
import { BidiLtr } from "../components/BidiLtr";
import { PhoneCountryField } from "../components/PhoneCountryField";
import { COUNTRY_DIAL_CODES, getCountryByIso } from "../data/countryDialCodes";
import { isValidNationalPhone, phoneFormToE164 } from "../utils/phoneValidation";

const API_URL = import.meta.env.VITE_API_URL;

type PlatformSettings = {
  contact_phone_1: string | null;
  contact_phone_label_1: string | null;
  contact_phone_2: string | null;
  contact_phone_label_2: string | null;
  contact_whatsapp: string | null;
  contact_whatsapp_enabled: boolean;
  contact_email: string | null;
  contact_address: string | null;
};

export function Contact() {
  const { t,isRTL } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [phoneCountryIso, setPhoneCountryIso] = useState('JO');
  const [phoneNational, setPhoneNational] = useState('');
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      if (!API_URL) return;
      try {
        const response = await fetch(`${API_URL}/settings/public`);
        const data = await response.json();
        if (!response.ok) return;
        if (isMounted) setSettings(data);
      } catch {
        // Same as footer: fallbacks below apply if settings fail to load.
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const contactPhone1 = settings?.contact_phone_1 || "962799096656";
  const contactPhone2 = settings?.contact_phone_2 || "962799967099";
  const contactEmail = settings?.contact_email || "hello@theagencyjo.com";
  const whatsappEnabled = settings?.contact_whatsapp_enabled ?? true;
  const whatsappPhone = settings?.contact_whatsapp || contactPhone1;
  const whatsappHref = useMemo(() => {
    const digits = whatsappPhone.replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : undefined;
  }, [whatsappPhone]);

  const visitAddress = settings?.contact_address?.trim() || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_URL) {
      toast.error(t('contact.configError'));
      return;
    }
    const nationalTrimmed = phoneNational.trim();
    if (nationalTrimmed && !isValidNationalPhone(nationalTrimmed)) {
      setPhoneInvalid(true);
      toast.error(t('validation.phoneNationalTenDigits'));
      return;
    }
    setPhoneInvalid(false);
    const phoneE164 = nationalTrimmed
      ? phoneFormToE164(phoneCountryIso, nationalTrimmed)
      : undefined;
    if (nationalTrimmed && !phoneE164) {
      setPhoneInvalid(true);
      toast.error(t('validation.phoneNationalTenDigits'));
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/contact-messages`, {
        name: formData.name,
        email: formData.email,
        phone: phoneE164,
        subject: formData.subject,
        message: formData.message,
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setPhoneCountryIso('JO');
      setPhoneNational('');
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, t('contact.form.errorSend'), t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-hero-noir text-white py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft size={18} /><span className="text-sm font-medium">{t("common.back")}</span>
          </button>
          <h1 className="text-5xl md:text-7xl font-bold font-['Tajawal'] mb-6">{t("contact.title")}</h1>
          <p className="text-xl text-white/80 max-w-3xl">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-[0_8px_24px_rgba(20,14,8,0.08)]">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{t("contact.call.title")}</h3>
                <p className="text-sm text-[#8c8c8c] mb-3">{t("contact.call.hours")}</p>
                <a href={`tel:${contactPhone1}`} className="text-black font-medium hover:underline block">
                  {settings?.contact_phone_label_1
                    ? formatLabeledPhone(settings.contact_phone_label_1, contactPhone1)
                    : formatLabeledPhone(null, contactPhone1)}
                </a>
                <a href={`tel:${contactPhone2}`} className="text-black font-medium hover:underline block mt-1">
                  {settings?.contact_phone_label_2
                    ? formatLabeledPhone(settings.contact_phone_label_2, contactPhone2)
                    : formatLabeledPhone(null, contactPhone2)}
                </a>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-[0_8px_24px_rgba(20,14,8,0.08)]">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{t("contact.email.title")}</h3>
                <p className="text-sm text-[#8c8c8c] mb-3">{t("contact.email.response")}</p>
                <a href={`mailto:${contactEmail}`} className="text-black font-medium hover:underline block">
                  <BidiLtr className="break-all">{contactEmail}</BidiLtr>
                </a>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-[0_8px_24px_rgba(20,14,8,0.08)]">
                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold text-black mb-2">{t("contact.whatsapp.title")}</h3>
                <p className="text-sm text-[#8c8c8c] mb-3">{t("contact.whatsapp.desc")}</p>
                {whatsappEnabled && whatsappHref ? (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="text-black font-medium hover:underline">
                    {t("contact.whatsapp.cta")}
                  </a>
                ) : null}
              </div>

              {visitAddress ? (
                <div className="bg-white p-6 rounded-xl shadow-[0_8px_24px_rgba(20,14,8,0.08)]">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">{t("contact.visit.title")}</h3>
                  <p className="text-sm text-[#8c8c8c] whitespace-pre-line">{visitAddress}</p>
                </div>
              ) : null}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl shadow-[0_8px_24px_rgba(20,14,8,0.08)]">
                <h2 className="text-3xl font-bold font-['Tajawal'] text-black mb-2">{t("contact.form.title")}</h2>
                <p className="text-[#8c8c8c] mb-8">{t("contact.form.desc")}</p>

                {submitted ? (
                  <div className="bg-[#525252]/10 border border-[#525252]/20 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#525252]/20 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-[#525252]" />
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">{t("contact.form.success")}</h3>
                    <p className="text-[#8c8c8c]">{t("contact.form.successDesc")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">{t("contact.form.name")} *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          {...formFieldDirProps(
                            isRTL,
                            "text",
                            "w-full px-4 py-3 rounded-lg border border-[#e8e8e8] focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-black bg-white",
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">{t("contact.form.email")} *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          {...formFieldDirProps(
                            isRTL,
                            "latin",
                            "w-full px-4 py-3 rounded-lg border border-[#e8e8e8] focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-black bg-white",
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">{t("contact.form.phone")}</label>
                        <PhoneCountryField
                          country={getCountryByIso(phoneCountryIso) ?? COUNTRY_DIAL_CODES[0]}
                          onCountryChange={(iso) => {
                            setPhoneInvalid(false);
                            setPhoneCountryIso(iso);
                          }}
                          nationalNumber={phoneNational}
                          onNationalNumberChange={(n) => {
                            setPhoneInvalid(false);
                            setPhoneNational(n);
                          }}
                          nationalPlaceholder={t('login.phoneNationalPlaceholder')}
                          invalid={phoneInvalid}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">{t("contact.form.subject")} *</label>
                        <select
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          {...formFieldDirProps(
                            isRTL,
                            "text",
                            "w-full px-4 py-3 rounded-lg border border-[#e8e8e8] focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-black bg-white",
                          )}
                        >
                          <option value="">{t("contact.form.selectSubject")}</option>
                          <option value="booking">{t("contact.form.booking")}</option>
                          <option value="event">{t("contact.form.event")}</option>
                          <option value="partnership">{t("contact.form.partnership")}</option>
                          <option value="technical">{t("contact.form.technical")}</option>
                          <option value="feedback">{t("contact.form.feedback")}</option>
                          <option value="other">{t("contact.form.other")}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">{t("contact.form.message")} *</label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.form.messagePlaceholder")}
                        {...formFieldDirProps(
                          isRTL,
                          "text",
                          "w-full px-4 py-3 rounded-lg border border-[#e8e8e8] focus:outline-none focus:ring-2 focus:ring-black/50 focus:border-black bg-white resize-none",
                        )}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-black text-white font-bold rounded-lg hover:bg-[#525252] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                    >
                      <Send className="w-5 h-5" />
                      {submitting ? t('contact.form.sending') : t("contact.form.send")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-4xl font-bold font-['Tajawal'] text-black text-center mb-4">{t("contact.faq.title")}</h2>
          <p className="text-center text-[#8c8c8c] mb-12 max-w-2xl mx-auto">
            {t("contact.faq.desc")}
          </p>

          <div className="max-w-3xl mx-auto space-y-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <details key={n} className="bg-white rounded-lg shadow-sm p-6 group">
                <summary className="font-bold text-black cursor-pointer list-none flex justify-between items-center">
                  {t(`contact.faq.q${n}`)}
                  <span className="text-black group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-[#8c8c8c] mt-4">
                  {t(`contact.faq.a${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
