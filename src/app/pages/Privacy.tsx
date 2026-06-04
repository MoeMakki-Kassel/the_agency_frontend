import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

export function Privacy() {
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
          <h1 className="text-4xl md:text-5xl font-bold font-['Tajawal'] mb-4">{t('privacy.title')}</h1>
          <p className="text-white/80">{t('privacy.updated')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="prose prose-lg max-w-none">

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.intro.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.intro.p1')}
              </p>
              <p className="text-[#8c8c8c]">
                {t('privacy.intro.p2')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.collect.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.collect.intro')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.collect.personal.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('privacy.collect.personal.item1')}</li>
                <li>{t('privacy.collect.personal.item2')}</li>
                <li>{t('privacy.collect.personal.item3')}</li>
                <li>{t('privacy.collect.personal.item4')}</li>
                <li>{t('privacy.collect.personal.item5')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.collect.transaction.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2 mb-4">
                <li>{t('privacy.collect.transaction.item1')}</li>
                <li>{t('privacy.collect.transaction.item2')}</li>
                <li>{t('privacy.collect.transaction.item3')}</li>
                <li>{t('privacy.collect.transaction.item4')}</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.collect.technical.title')}</h3>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('privacy.collect.technical.item1')}</li>
                <li>{t('privacy.collect.technical.item2')}</li>
                <li>{t('privacy.collect.technical.item3')}</li>
                <li>{t('privacy.collect.technical.item4')}</li>
                <li>{t('privacy.collect.technical.item5')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.use.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.use.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('privacy.use.item1')}</li>
                <li>{t('privacy.use.item2')}</li>
                <li>{t('privacy.use.item3')}</li>
                <li>{t('privacy.use.item4')}</li>
                <li>{t('privacy.use.item5')}</li>
                <li>{t('privacy.use.item6')}</li>
                <li>{t('privacy.use.item7')}</li>
                <li>{t('privacy.use.item8')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.sharing.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.sharing.intro')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.sharing.organizers.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.sharing.organizers.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.sharing.providers.title')}</h3>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.sharing.providers.desc')}
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{t('privacy.sharing.legal.title')}</h3>
              <p className="text-[#8c8c8c]">
                {t('privacy.sharing.legal.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.security.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.security.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li>{t('privacy.security.item1')}</li>
                <li>{t('privacy.security.item2')}</li>
                <li>{t('privacy.security.item3')}</li>
                <li>{t('privacy.security.item4')}</li>
                <li>{t('privacy.security.item5')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.rights.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.rights.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li><strong>{t('privacy.rights.access')}</strong> {t('privacy.rights.access.desc')}</li>
                <li><strong>{t('privacy.rights.correction')}</strong> {t('privacy.rights.correction.desc')}</li>
                <li><strong>{t('privacy.rights.deletion')}</strong> {t('privacy.rights.deletion.desc')}</li>
                <li><strong>{t('privacy.rights.portability')}</strong> {t('privacy.rights.portability.desc')}</li>
                <li><strong>{t('privacy.rights.optout')}</strong> {t('privacy.rights.optout.desc')}</li>
                <li><strong>{t('privacy.rights.object')}</strong> {t('privacy.rights.object.desc')}</li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.cookies.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.cookies.intro')}
              </p>
              <ul className="list-disc pl-6 text-[#8c8c8c] space-y-2">
                <li><strong>{t('privacy.cookies.essential')}</strong> {t('privacy.cookies.essential.desc')}</li>
                <li><strong>{t('privacy.cookies.analytics')}</strong> {t('privacy.cookies.analytics.desc')}</li>
                <li><strong>{t('privacy.cookies.marketing')}</strong> {t('privacy.cookies.marketing.desc')}</li>
              </ul>
              <p className="text-[#8c8c8c] mt-4">
                {t('privacy.cookies.control')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.children.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('privacy.children.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.international.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('privacy.international.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.changes.title')}</h2>
              <p className="text-[#8c8c8c]">
                {t('privacy.changes.desc')}
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('privacy.contact.title')}</h2>
              <p className="text-[#8c8c8c] mb-4">
                {t('privacy.contact.intro')}
              </p>
              <div className="bg-[#e8e8e8] p-6 rounded-lg">
                <p className="text-foreground mb-2"><strong>{t('privacy.contact.email')}</strong> privacy@theagencyjo.com</p>
                <p className="text-foreground mb-2">
                  <strong>{t('privacy.contact.phone')}</strong>{' '}
                  <span dir="ltr" className="inline-block [unicode-bidi:isolate] tabular-nums">
                    {t('privacy.contact.phoneValue')}
                  </span>
                </p>
                <p className="text-foreground"><strong>{t('privacy.contact.address')}</strong> {t('privacy.contact.addressValue')}</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
