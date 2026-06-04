import { Link } from "react-router";
import {
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { SiteLogo } from "./SiteLogo";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { BidiLtr } from "./BidiLtr";
import { formatLabeledPhone } from "../utils/localeFormat";

type PlatformSettings = {
  contact_phone_1: string | null;
  contact_phone_label_1: string | null;
  contact_phone_2: string | null;
  contact_phone_label_2: string | null;
  contact_whatsapp: string | null;
  contact_whatsapp_enabled: boolean;
  contact_email: string | null;
};

export function Footer() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings/public`);
        const data = await response.json();
        if (!response.ok) return;
        if (isMounted) setSettings(data);
      } catch {
        // Keep footer fallback values if settings cannot be loaded.
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  const contactPhone1 = settings?.contact_phone_1 || "962799096656";
  const contactPhone2 = settings?.contact_phone_2 || "962799967099";
  const contactEmail = settings?.contact_email || "hello@theagencyjo.com";
  const whatsappEnabled = settings?.contact_whatsapp_enabled ?? true;
  const whatsappPhone = settings?.contact_whatsapp || contactPhone1;
  const whatsappHref = useMemo(() => {
    const digits = whatsappPhone.replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : undefined;
  }, [whatsappPhone]);

  return (
    <footer className="bg-background pt-16 pb-8 border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 lg:gap-x-16">
          {/* Logo & Tagline */}
          <div className="lg:col-span-2">
            <SiteLogo variant="onDark" className="mb-6" />
            <p className="text-muted-foreground max-w-sm text-[16px] leading-[24px]">
              {t("footer.title")}{" "}
            </p>
          </div>

          {/* Company + support links in one scannable block */}
          <div className="flex flex-col gap-5 lg:max-w-[280px]">
            <h4 className="text-foreground font-semibold text-[20px] leading-tight">
              {t("footer.quickLinks")}
            </h4>
            <nav
              className="flex flex-col items-start gap-2.5"
              aria-label={t("footer.quickLinks")}
            >
              <Link
                to="/events"
                className="text-muted-foreground hover:text-primary transition-colors text-[15px] leading-snug"
              >
                {t("nav.events")}
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-primary transition-colors text-[15px] leading-snug"
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-primary transition-colors text-[15px] leading-snug"
              >
                {t("nav.contact")}
              </Link>
            </nav>
            <nav
              className="mt-3 flex w-full flex-col items-start gap-2.5 border-t border-border pt-3"
              aria-label={t("footer.legal")}
            >
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors text-[15px] leading-snug"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-primary transition-colors text-[15px] leading-snug"
              >
                {t("footer.terms")}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-foreground font-semibold text-[20px] mb-2">
              {t("nav.contact")}
            </h4>
            <a
              href={`tel:${contactPhone1}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
            >
              <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span>
                {settings?.contact_phone_label_1
                  ? formatLabeledPhone(settings.contact_phone_label_1, contactPhone1)
                  : formatLabeledPhone(null, contactPhone1)}
              </span>
            </a>
            <a
              href={`tel:${contactPhone2}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
            >
              <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span>
                {settings?.contact_phone_label_2
                  ? formatLabeledPhone(settings.contact_phone_label_2, contactPhone2)
                  : formatLabeledPhone(null, contactPhone2)}
              </span>
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
            >
              <Mail className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <BidiLtr className="break-all">{contactEmail}</BidiLtr>
            </a>
            {whatsappEnabled && whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-foreground font-medium mt-2 hover:opacity-80 transition-opacity"
              >
                <MessageCircle className="w-5 h-5 text-primary" />
                {t("footer.whatssupport")}{" "}
              </a>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm text-center md:text-start">
            © 2026 TheAgencyJo. {t("footer.allRights")}
          </p>
        </div>

        <p className="text-muted-foreground text-xs text-center mt-6 tracking-wide">
          {t("footer.poweredByPrefix")}{" "}
          <a
            href="https://www.kasselsoft.com"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Kasselsoft
          </a>{" "}
          {t("footer.poweredByAnd")}{" "}
          <a
            href="https://www.kastana.net"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-primary transition-colors"
          >
            Kastana
          </a>
        </p>
      </div>
    </footer>
  );
}
