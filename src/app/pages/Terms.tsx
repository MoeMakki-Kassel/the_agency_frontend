import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

export function Terms() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-hero-noir text-white py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft size={18} /><span className="text-sm font-medium">{t("common.back")}</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold font-['Tajawal'] mb-4">{t('terms.title')}</h1>
          <p className="text-white/80">{t('terms.updated')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="prose prose-lg max-w-none">

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.agreement.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.agreement.p1')}
              </p>
              <p className="text-[#8c8c8c]">
                {t('terms.agreement.p2')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.use.title')}</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.use.eligibility.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.use.eligibility.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.use.registration.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('terms.use.registration.item1')}</li>
                <li>{t('terms.use.registration.item2')}</li>
                <li>{t('terms.use.registration.item3')}</li>
                <li>{t('terms.use.registration.item4')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.use.prohibited.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.use.prohibited.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('terms.use.prohibited.item1')}</li>
                <li>{t('terms.use.prohibited.item2')}</li>
                <li>{t('terms.use.prohibited.item3')}</li>
                <li>{t('terms.use.prohibited.item4')}</li>
                <li>{t('terms.use.prohibited.item5')}</li>
                <li>{t('terms.use.prohibited.item6')}</li>
                <li>{t('terms.use.prohibited.item7')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.purchases.title')}</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.purchases.process.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.purchases.process.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('terms.purchases.process.item1')}</li>
                <li>{t('terms.purchases.process.item2')}</li>
                <li>{t('terms.purchases.process.item3')}</li>
                <li>{t('terms.purchases.process.item4')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.purchases.pricing.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('terms.purchases.pricing.item1')}</li>
                <li>{t('terms.purchases.pricing.item2')}</li>
                <li>{t('terms.purchases.pricing.item3')}</li>
                <li>{t('terms.purchases.pricing.item4')}</li>
                <li>{t('terms.purchases.pricing.item5')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.purchases.limits.title')}</h3>
              <p className="text-[#8c8c8c]">
                {t('terms.purchases.limits.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.refunds.title')}</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.refunds.cancellation.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.refunds.cancellation.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('terms.refunds.cancellation.item1')}</li>
                <li>{t('terms.refunds.cancellation.item2')}</li>
                <li>{t('terms.refunds.cancellation.item3')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.refunds.postponement.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.refunds.postponement.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.refunds.customer.title')}</h3>
              <p className="text-[#8c8c8c]">
                {t('terms.refunds.customer.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.access.title')}</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.access.entry.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('terms.access.entry.item1')}</li>
                <li>{t('terms.access.entry.item2')}</li>
                <li>{t('terms.access.entry.item3')}</li>
                <li>{t('terms.access.entry.item4')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.access.prohibited.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.access.prohibited.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.access.behavior.title')}</h3>
              <p className="text-[#8c8c8c]">
                {t('terms.access.behavior.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.ip.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.ip.p1')}
              </p>
              <p className="text-[#8c8c8c]">
                {t('terms.ip.p2')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.liability.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.liability.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('terms.liability.item1')}</li>
                <li>{t('terms.liability.item2')}</li>
                <li>{t('terms.liability.item3')}</li>
                <li>{t('terms.liability.item4')}</li>
                <li>{t('terms.liability.item5')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.indemnification.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('terms.indemnification.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.privacy.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('terms.privacy.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.disputes.title')}</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.disputes.law.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.disputes.law.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('terms.disputes.process.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.disputes.process.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('terms.disputes.process.item1')}</li>
                <li>{t('terms.disputes.process.item2')}</li>
                <li>{t('terms.disputes.process.item3')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.changes.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('terms.changes.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.termination.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('terms.termination.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.severability.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('terms.severability.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('terms.contact.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('terms.contact.intro')}
              </p>
              <div className="bg-[#e8e8e8] p-6 rounded-lg">
                <p className="text-foreground mb-2"><strong>{t('terms.contact.email')}</strong> {t('terms.contact.emailValue')}</p>
                <p className="text-foreground mb-2">
                  <strong>{t('terms.contact.phone')}</strong>{' '}
                  <span dir="ltr" className="inline-block [unicode-bidi:isolate] tabular-nums">
                    {t('terms.contact.phoneValue')}
                  </span>
                </p>
                <p className="text-foreground"><strong>{t('terms.contact.address')}</strong> {t('terms.contact.addressValue')}</p>
              </div>
            </div>

            <div className="bg-[#e8e8e8] p-6 rounded-lg mt-12">
              <p className="text-sm text-[#8c8c8c]">
                {t('terms.acknowledgment')}
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
