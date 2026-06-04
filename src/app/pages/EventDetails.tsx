import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  Calendar,
  MapPin,
  Ticket,
  AlertCircle,
  Phone,
  MessageCircle,
  Map,
  Share2,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";

import { BookingWizard } from "../components/BookingWizard";
import axios from "axios";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import {
  formatEventDateTimeRange,
  interpolateTemplate,
  useAppLocale,
} from "../hooks/useAppLocale";
import { usePriceFormat } from "../hooks/usePriceFormat";
import { BidiLtr } from "../components/BidiLtr";
import {
  formatEventAgeRestriction,
  hasAgeRestriction,
} from "../utils/eventAgeRestriction";
import { displayTierName, sortTiersByPriceDesc } from "../utils/tierDisplay";
import { textDirectionForContent } from "../utils/textDirection";
const API_URL = import.meta.env.VITE_API_URL;

/** Accepts a maps embed URL or raw iframe HTML; returns a safe https Google Maps embed src or null. */
function getGoogleMapsEmbedSrc(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (!s) return null;
  const iframeMatch = s.match(/<iframe\b[^>]*?\bsrc=["']([^"']+)["']/i);
  if (iframeMatch?.[1]) s = iframeMatch[1].trim();
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return null;
    const host = u.hostname.toLowerCase();
    const allowedHost =
      host === "google.com" ||
      host === "www.google.com" ||
      host === "maps.google.com";
    if (!allowedHost) return null;
    if (!u.pathname.includes("/maps")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Read pb= from a Maps URL without re-encoding `!` (searchParams.set breaks Google's pb format). */
function extractPbFromMapsUrl(mapsUrl: string): string | null {
  try {
    const fromParams = new URL(mapsUrl).searchParams.get("pb");
    if (fromParams) return fromParams;
  } catch {
    /* fall through */
  }
  const m = mapsUrl.match(/[?&]pb=([^&"'>\s]+)/i);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

/** Parse lat/lng/place name from Google Maps embed `pb` payloads. */
function parsePbLocation(pb: string): {
  lat: number;
  lng: number;
  name?: string;
  placeRef?: string;
} | null {
  const lat = Number(pb.match(/!3d(-?[\d.]+)/)?.[1]);
  const lng = Number(pb.match(/!2d(-?[\d.]+)/)?.[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const nameRaw = pb.match(/!2s([^!]+)/)?.[1];
  const name = nameRaw
    ? decodeURIComponent(nameRaw.replace(/\+/g, " ")).trim()
    : undefined;

  const placeRefRaw = pb.match(/!1s([^!]+)/)?.[1];
  const placeRef = placeRefRaw
    ? decodeURIComponent(placeRefRaw.replace(/\+/g, " ")).trim()
    : undefined;

  return { lat, lng, name: name || undefined, placeRef: placeRef || undefined };
}

/** Turn a validated Google Maps embed src into the matching "open in Maps" URL. */
function googleMapsOpenUrlFromEmbedSrc(embedSrc: string): string | null {
  try {
    const pb = extractPbFromMapsUrl(embedSrc);
    if (pb) {
      const place = parsePbLocation(pb);
      if (place?.name) {
        return `https://www.google.com/maps/place/${encodeURIComponent(place.name)}/@${place.lat},${place.lng},17z`;
      }
      if (place) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.lat},${place.lng}`)}`;
      }
      // Keep `!` unencoded — URLSearchParams.set encodes them as %21 and breaks Maps.
      return `https://www.google.com/maps?pb=${pb}`;
    }

    const u = new URL(embedSrc);

    const q = u.searchParams.get("q");
    if (q) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    }

    const placeId = u.searchParams.get("place_id");
    if (placeId) {
      return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
    }

    const cid = u.searchParams.get("cid");
    if (cid) {
      return `https://www.google.com/maps?cid=${encodeURIComponent(cid)}`;
    }

    const ll = u.searchParams.get("ll") ?? u.searchParams.get("center");
    if (ll) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ll)}`;
    }

    if (u.pathname.includes("/embed")) {
      const open = new URL(u.toString());
      open.pathname = open.pathname.replace(/\/embed\b/, "") || "/maps";
      open.searchParams.delete("output");
      return open.toString();
    }

    return null;
  } catch {
    return null;
  }
}

function googleMapsOpenUrl(ev: {
  map_embed_url?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  full_address?: string | null;
  location_name?: string | null;
}): string {
  const embedSrc = getGoogleMapsEmbedSrc(ev.map_embed_url);
  if (embedSrc) {
    const fromEmbed = googleMapsOpenUrlFromEmbedSrc(embedSrc);
    if (fromEmbed) return fromEmbed;
  }

  if (ev.location_lat != null && ev.location_lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ev.location_lat},${ev.location_lng}`)}`;
  }
  const q = (ev.full_address || ev.location_name || "").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function EventDetails() {
  // const { slug } = useParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const locale = useAppLocale();
  const { formatFromPrice, formatDecimal } = usePriceFormat();

  const [bookingWizardOpen, setBookingWizardOpen] = useState(false);
  const [event, setEvent] = useState<any>(null);

  const eventDateTimeLabel = useMemo(
    () =>
      formatEventDateTimeRange(event?.date_time, event?.end_date_and_time, locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [event?.date_time, event?.end_date_and_time, locale],
  );

  const sortedTiers = useMemo(
    () =>
      sortTiersByPriceDesc(
        (event?.tiers ?? []) as {
          id: string;
          name: string;
          price: number;
          description?: string;
          selection_mode?: string;
          venue_tier_key?: string;
        }[],
      ),
    [event?.tiers],
  );

  const minTierPrice = sortedTiers.length
    ? Math.min(...sortedTiers.map((tier) => tier.price))
    : 0;

  const showAgeRestriction = hasAgeRestriction(event?.age_restriction);
  const ageRestrictionLabel = useMemo(() => {
    if (!showAgeRestriction || event?.age_restriction == null) {
      return t("event.age.allAges");
    }
    return formatEventAgeRestriction(event.age_restriction);
  }, [event?.age_restriction, showAgeRestriction, t]);

  const descriptionDir = useMemo(
    () => textDirectionForContent(event?.description),
    [event?.description],
  );

  const getEventById = useCallback(async () => {
    if (!id) return;
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      const url = isUuid ? `${API_URL}/events/${id}` : `${API_URL}/events/slug/${encodeURIComponent(id)}`;
      const res = await axios.get(url, { params: { _t: Date.now() } });
      setEvent(res.data);
    } catch (error) {
      toast.error(t("events.toast.loadError"));
    }
  }, [id, t]);

  const openBookingWizard = useCallback(async () => {
    await getEventById();
    setBookingWizardOpen(true);
  }, [getEventById]);

  const bookingTierKey = useMemo(
    () => (event?.tiers ?? []).map((tier: { id: string }) => tier.id).join(","),
    [event?.tiers],
  );

  useEffect(() => {
    getEventById();
  }, [getEventById]);

  const isUuidParam = id
    ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    : false;

  useEffect(() => {
    if (!event?.slug || !id || !isUuidParam) return;
    if (event.slug && event.slug !== id) {
      navigate(`/event/${event.slug}${location.hash}`, { replace: true });
    }
  }, [event, id, isUuidParam, navigate, location.hash]);

  useLayoutEffect(() => {
    if (!event) return;
    if (location.hash === "#event-reserve") {
      const scrollToReserve = () => {
        document.getElementById("event-reserve")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      };
      requestAnimationFrame(() => requestAnimationFrame(scrollToReserve));
    } else {
      window.scrollTo(0, 0);
    }
  }, [event, event?.id, location.pathname, location.hash]);

  const shareEvent = useCallback(async () => {
    const slug = event?.slug ?? id;
    if (!slug) {
      toast.error(t("event.toast.notLoaded"));
      return;
    }

    const url = `${window.location.origin}/event/${encodeURIComponent(slug)}`;
    const title = typeof event?.title === "string" ? event.title : "";
    const subtitle = typeof event?.subtitle === "string" ? event.subtitle : "";
    const text = subtitle ? `${title} — ${subtitle}` : title;

    if (typeof navigator.share === "function") {
      try {
        const payload: ShareData = { url };
        if (title) payload.title = title;
        if (text) payload.text = text;
        if (typeof navigator.canShare === "function" && !navigator.canShare(payload)) {
          delete payload.text;
        }
        await navigator.share(payload);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.left = "-9999px";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      toast.success(t("event.share.copied"));
    } catch {
      toast.error(t("event.share.failed"));
    }
  }, [event?.slug, event?.subtitle, event?.title, id, t]);
  return (
    <div className="bg-background min-h-screen text-foreground font-['Inter'] pb-20 lg:pb-0">
      {/* 3.2.1 — Hero Banner */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden flex items-end pb-16">
        <div className="absolute inset-0">
          <img
            src={event?.cover_photo}
            alt={event?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 to-[#0A0A0A]/90"></div>
          {/* Spotlight motif */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,111,74,0.15)_0%,transparent_50%)] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft size={18} /><span className="text-sm font-medium">{t("common.back")}</span>
          </button>
          <h1 className="text-5xl md:text-7xl font-bold font-['Tajawal'] text-white mb-4">
            {event?.title}
          </h1>
          <h4 className="text-xl md:text-2xl font-semibold text-white/80">
            {event?.subtitle}
          </h4>
        </div>
      </section>

      {/* 3.2.2 — Quick Facts Strip */}
      <div className="bg-[#0A0A0A] text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-y-6 justify-between items-center text-sm md:text-base">
            <div
              className="flex items-center gap-3 w-1/2 md:w-auto"
              aria-label={t("event.quickFacts.date")}
            >
              <Calendar className="text-foreground" size={20} aria-hidden />
              <span>{eventDateTimeLabel}</span>
            </div>
            <div
              className="flex items-center gap-3 w-1/2 md:w-auto"
              aria-label={t("event.quickFacts.venue")}
            >
              <MapPin className="text-foreground" size={20} aria-hidden />
              <span>{event?.location_name}</span>
            </div>
            <div
              className="flex items-center gap-3 w-1/3 md:w-auto"
              aria-label={t("event.quickFacts.price")}
            >
              <Ticket className="text-foreground" size={20} aria-hidden />
              <span>
                {event?.tiers?.length
                  ? formatFromPrice(
                      Math.min(...event.tiers.map((tier: { price: number }) => tier.price)),
                    )
                  : formatFromPrice(0)}
              </span>
            </div>
            {/* <div className="flex items-center gap-3 w-1/3 md:w-auto">
              <Clock className="text-foreground" size={20} />
              <span>{EVENT.duration}</span>
            </div> */}
            <div
              className="flex items-center gap-3 w-1/3 md:w-auto"
              aria-label={t("event.quickFacts.age")}
            >
              <AlertCircle className="text-foreground" size={20} aria-hidden />
              <span>{ageRestrictionLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3.2.3 — Two-Column Body Layout */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">
        {/* Left column (60%) */}
        <div className="w-full lg:w-3/5 space-y-16">
          {/* About */}
          <section>
            <h2 className="text-3xl font-bold font-['Tajawal'] mb-6">
              {t("event.about.title")}
            </h2>
            <div
              dir={descriptionDir}
              className="prose prose-lg max-w-none text-foreground/80 whitespace-pre-wrap text-start [unicode-bidi:isolate] first-letter:text-5xl first-letter:font-bold first-letter:text-foreground first-letter:me-2 first-letter:float-start"
            >
              {event?.description}
            </div>
          </section>

          {Array.isArray(event?.sponsors) && event.sponsors.length > 0 && (
            <section
              aria-label={t("event.sponsors.title")}
              className="rounded-2xl border border-border bg-gradient-to-br from-[#fafafa] to-white p-8 shadow-[0_8px_24px_rgba(20,14,8,0.04)]"
            >
              <h2 className="text-2xl md:text-3xl font-bold font-['Tajawal'] mb-2 text-foreground">
                {t("event.sponsors.title")}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xl">
                {t("event.sponsors.subtitle")}
              </p>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6 list-none m-0 p-0">
                {event.sponsors.map((sp: { id?: string; sponsor_name?: string; logo?: string | null }) => {
                  const sid = typeof sp?.id === "string" ? sp.id : String(sp?.id ?? "");
                  const name = typeof sp?.sponsor_name === "string" ? sp.sponsor_name : "";
                  const logo = typeof sp?.logo === "string" && sp.logo.trim() ? sp.logo.trim() : null;
                  if (!sid || !name) return null;
                  return (
                    <li
                      key={sid}
                      className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-4 py-6 md:py-8 min-h-[112px]"
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt=""
                          className="max-h-14 md:max-h-16 w-full object-contain"
                        />
                      ) : (
                        <span className="text-center font-semibold text-foreground text-sm md:text-base leading-snug px-1">
                          {name}
                        </span>
                      )}
                      {logo ? (
                        <span className="mt-3 text-xs text-center text-muted-foreground leading-snug line-clamp-2">
                          {name}
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Event Contact */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            <div className="border-s-4 border-black p-8">
              <h3 className="text-xl font-bold font-['Tajawal'] mb-6">
                {t("event.contact.title")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <a
                  href={`tel:${event?.contact_phone}`}
                  className="flex items-center p-4 bg-card rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors me-4 shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("event.contact.bookings")}
                    </div>
                    <BidiLtr className="font-bold text-lg block">
                      {event?.contact_phone}
                    </BidiLtr>
                  </div>
                </a>
                <a
                  href={`mailto:${event?.contact_email}`}
                  className="flex items-center p-4 bg-card rounded-lg hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors me-4 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("event.contact.email")}
                    </div>
                    <BidiLtr className="font-bold text-lg block break-all">
                      {event?.contact_email}
                    </BidiLtr>
                  </div>
                </a>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-6">
                <a
                  href={`https://wa.me/${event?.contact_phone}`}
                  className="flex items-center text-[#525252] font-bold hover:underline"
                >
                  <MessageCircle size={20} className="me-2 shrink-0" />
                  {t("event.contact.whatsapp")}
                </a>
                {/* <span className="text-sm text-muted-foreground">Mon-Sun, 10am - 8pm</span> */}
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h3 className="text-2xl font-bold font-['Tajawal'] mb-2">
              {t("event.location.title")}
            </h3>
            <h4 className="text-xl font-semibold mb-1">
              {event?.location_name}
            </h4>
            <p className="text-muted-foreground mb-6">{event?.full_address}</p>

            <div className="mb-6 rounded-xl overflow-hidden border border-border bg-muted aspect-[16/10] min-h-[220px] max-h-[480px] relative">
              {(() => {
                const embedSrc = event ? getGoogleMapsEmbedSrc(event.map_embed_url) : null;
                if (embedSrc) {
                  return (
                    <iframe
                      title={
                        event?.location_name
                          ? interpolateTemplate(t("event.location.mapTitleNamed"), {
                              name: event.location_name,
                            })
                          : t("event.location.mapTitle")
                      }
                      src={embedSrc}
                      className="absolute inset-0 h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center text-foreground pointer-events-none">
                      <MapPin size={32} className="fill-current" />
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex flex-wrap gap-3">
              {event && (
                <a
                  href={googleMapsOpenUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-[#525252] transition-colors items-center"
                >
                  <Map size={18} className="me-2 shrink-0" /> {t("event.location.googleMaps")}
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Right column (40%) — Sticky Booking Card */}
        <div className="w-full lg:w-2/5 relative" id="event-reserve">
          <div className="sticky top-8 bg-card border border-border rounded-xl shadow-[0_12px_48px_rgba(0,0,0,0.5)] p-8">
            <h3 className="text-2xl font-bold font-['Tajawal'] mb-6">
              {t("event.booking.title")}
            </h3>

            <div className="space-y-4 mb-8">
              {sortedTiers.map((tier) => (
                <div
                  key={tier.id}
                  className="block border-2 rounded-xl p-4 border-border"
                >
                  <div className="font-bold text-lg">
                    {displayTierName(tier, t("tier.regular"))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <BidiLtr>{formatDecimal(tier.price)}</BidiLtr> {t("event.booking.perSeat")}
                  </div>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                  )}
                </div>
              ))}
            </div>

            {sortedTiers.length > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                {formatFromPrice(minTierPrice ?? 0)}
              </p>
            )}

            <button
              type="button"
              onClick={() => void openBookingWizard()}
              disabled={!sortedTiers.length}
              className="w-full py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-[#525252] transition-colors mb-3 shadow-lg shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {t("event.booking.bookNow")}
            </button>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-8 mt-3">
              <span className="flex items-center">
                <Lock size={14} className="me-1 shrink-0" /> {t("event.booking.secure")}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Ticket size={14} className="me-1 shrink-0" /> {t("event.booking.instantQR")}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => void shareEvent()}
                disabled={!event?.slug && !id}
                aria-label={t("event.share.aria")}
                className="w-10 h-10 rounded-full bg-background text-foreground flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile Book Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {t("events.from")} {minTierPrice} {t("events.currencyJod")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void openBookingWizard()}
            disabled={!sortedTiers.length}
            className="flex-1 max-w-[200px] py-3 bg-black text-white font-bold rounded-xl hover:bg-[#525252] transition-colors shadow-lg shadow-black/20 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {t("event.booking.bookNow")}
          </button>
        </div>
      </div>

      {bookingWizardOpen && event && (
        <BookingWizard
          key={`${event.id}-${bookingTierKey}`}
          event={{
            id: event.id,
            title: event.title,
            max_tickets_per_order: event.max_tickets_per_order,
            venue_template_id: (event as { venue_template_id?: string | null }).venue_template_id,
            tiers: sortedTiers,
          }}
          onClose={() => setBookingWizardOpen(false)}
        />
      )}
    </div>
  );
}

