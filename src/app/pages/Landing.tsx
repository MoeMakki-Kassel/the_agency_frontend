import { Link } from "react-router";
import {
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  ArrowRight,
  Star,
} from "lucide-react";
import artistPhoto from "../../imports/photo-1.png";
import { useLanguage } from "../contexts/LanguageContext";
import { formatEventDateTime, formatEventDateTimeRange, useAppLocale } from "../hooks/useAppLocale";
import { usePriceFormat } from "../hooks/usePriceFormat";
import { formFieldDirProps } from "../utils/formFieldDir";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getUserFacingErrorMessage } from "../utils/userFacingError";
import { toast } from "sonner";
import { SiteLogo } from "../components/SiteLogo";
const API_URL = import.meta.env.VITE_API_URL;

export function Landing() {
  const { t, isRTL } = useLanguage();
  const locale = useAppLocale();
  const { formatFromPrice } = usePriceFormat();
  const [events, setEvents] = useState<any[]>([]);
  const [filterValue, setFilterValue] = useState<"all" | "this-week" | "this-month">("all");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const getAllEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data.data);
    } catch (error) {
      toast.error(t("events.toast.loadError"));
    }
  }, [t]);
  useEffect(() => {
    window.scrollTo(0,0)
    getAllEvents();
  }, [getAllEvents]);

  const filteredEvents = events.filter((e) => {
    if (filterValue === "all") return true;
    const eventDate = new Date(e.date_time);
    const now = new Date();
    if (filterValue === "this-week") {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() + 7);
      return eventDate >= now && eventDate <= weekEnd;
    }
    if (filterValue === "this-month") {
      return eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth();
    }
    return true;
  });
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative w-full flex flex-col items-center justify-center bg-hero-noir px-4 pt-8 pb-10 sm:min-h-[80vh] sm:h-[85vh] sm:px-6 sm:pt-0 sm:pb-0 lg:min-h-[85vh] lg:h-[90vh] lg:px-8">
        <div className="max-w-[1440px] w-full mx-auto text-center flex flex-col items-center">
          <Link to="/" aria-label="Home" className="mb-5 sm:mb-10 md:mb-12">
            <SiteLogo
              variant="onDark"
              className="h-10 sm:h-16 md:h-20 w-auto mx-auto cursor-pointer hover:opacity-90 transition-opacity"
            />
          </Link>

          <h1 className="font-display font-bold uppercase tracking-tight leading-none text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl max-w-4xl mb-3 sm:mb-5">
            {t("home.hero.title")}
          </h1>
          <p className="font-arabic font-bold text-white text-lg sm:text-2xl md:text-3xl mb-3 sm:mb-6 max-w-3xl">
            {t("home.hero.taglineAr")}
          </p>
          <p className="text-white/70 font-sans text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-6 sm:mb-10">
            {t("home.hero.description")}
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("upcoming-events")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-6 sm:px-8 py-2.5 sm:py-4 rounded-full bg-signature-gradient text-white font-semibold text-sm sm:text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(220,38,38,0.4)]"
          >
            {t("home.hero.browseEvents")}
          </button>
        </div>
      </section>

      {/* Section 3 — Upcoming Events Grid */}
      <section
        id="upcoming-events"
        className="py-12 sm:py-16 md:py-24 bg-background"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-ink-black mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl">
                {t("home.upcoming.title")}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterValue("all")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium ${filterValue === "all" ? "bg-primary text-primary-foreground" : "border border-[#e8e8e8] text-mid-gray hover:border-mid-gray transition-colors"}`}
                >
                  {t("home.upcoming.all")}
                </button>
                <button
                  onClick={() => setFilterValue("this-week")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium ${filterValue === "this-week" ? "bg-primary text-primary-foreground" : "border border-[#e8e8e8] text-mid-gray hover:border-mid-gray transition-colors"}`}
                >
                  {t("home.upcoming.thisWeek")}
                </button>
                <button
                  onClick={() => setFilterValue("this-month")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium ${filterValue === "this-month" ? "bg-primary text-primary-foreground" : "border border-[#e8e8e8] text-mid-gray hover:border-mid-gray transition-colors"}`}
                >
                  {t("home.upcoming.thisMonth")}
                </button>
                
              </div>
            </div>
            <Link
              to="/events"
              className="hidden md:flex items-center gap-2 text-foreground font-medium hover:underline"
            >
              {t("home.upcoming.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((event) => {
              const formattedDate = (
                event.end_date_and_time
                  ? formatEventDateTimeRange(event.date_time, event.end_date_and_time, locale, {
                      day: "2-digit",
                      month: "short",
                    })
                  : formatEventDateTime(event.date_time, locale, {
                      day: "2-digit",
                      month: "short",
                    })
              ).toUpperCase();
              const lowestPrice = event.tiers?.length
                ? Math.min(...event.tiers.map((t: any) => t.price))
                : null;
              const slugOrId = event.slug || event.id;
              return (
                <div
                  key={event.id}
                  className="group bg-card rounded-[12px] overflow-hidden border border-border shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden bg-[#e8e8e8]">
                    <img
                      src={event.cover_photo}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 right-3 sm:left-4 sm:right-4 flex items-start gap-2">
                      <div className="shrink-0 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-ink-black shadow-sm">
                        {formattedDate}
                      </div>
                      {event.subtitle && (
                        <div className="min-w-0 flex-1 flex justify-end overflow-hidden">
                          <div
                            className="max-w-full truncate bg-foreground/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white"
                            title={event.subtitle}
                          >
                            {event.subtitle}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <h4 className="text-ink-black mb-2 line-clamp-1 text-lg sm:text-xl">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-mid-gray mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">
                        {event.location_name}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#e8e8e8]">
                      <div>
                        <div className="text-foreground font-bold text-lg sm:text-xl font-display">
                          {lowestPrice != null ? formatFromPrice(lowestPrice) : "—"}
                        </div>
                      </div>
                      <div className="group/tooltip relative">
                        <a
                          href={`tel:${event.contact_phone}`}
                          className="flex items-center p-4 bg-card rounded-lg hover:shadow-md transition-shadow group"
                        >
                          <button className="p-2 rounded-full border border-[#e8e8e8] text-mid-gray hover:text-foreground hover:border-black transition-colors">
                            <Phone className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 bg-primary text-primary-foreground text-xs rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity">
                            {t("event.contact.title")}
                          </div>
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <Link
                        to={`/event/${slugOrId}#event-reserve`}
                        className="flex-1 text-center py-2.5 sm:py-3 rounded-[8px] bg-primary text-primary-foreground font-medium hover:bg-accent transition-colors text-sm"
                      >
                        {t("home.upcoming.bookNow")}
                      </Link>
                      <Link
                        to={`/event/${slugOrId}`}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-[8px] bg-[#e8e8e8]/30 text-ink-black font-medium hover:bg-[#e8e8e8]/50 transition-colors text-sm"
                      >
                        {t("home.upcoming.details")}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-12 text-center md:hidden">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-foreground font-medium hover:underline"
            >
              {t("home.upcoming.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

     

      {/* Section 5 — Why TheAgencyJo. */}
      <section className="py-12 sm:py-16 md:py-24 bg-background">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-ink-black mb-10 sm:mb-16 text-3xl sm:text-4xl md:text-5xl">
            {t("home.why.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h4 className="text-ink-black mb-2 sm:mb-3 text-lg sm:text-xl">
                {t("home.why.curated.title")}
              </h4>
              <p className="text-mid-gray max-w-xs text-sm sm:text-base">
                {t("home.why.curated.desc")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h4 className="text-ink-black mb-2 sm:mb-3 text-lg sm:text-xl">
                {t("home.why.secure.title")}
              </h4>
              <p className="text-mid-gray max-w-xs text-sm sm:text-base">
                {t("home.why.secure.desc")}
              </p>
            </div>
            <div className="flex flex-col items-center sm:col-span-2 md:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <Ticket className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h4 className="text-ink-black mb-2 sm:mb-3 text-lg sm:text-xl">
                {t("home.why.tickets.title")}
              </h4>
              <p className="text-mid-gray max-w-xs text-sm sm:text-base">
                {t("home.why.tickets.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 — Testimonials */}
      <section className="py-12 sm:py-16 md:py-24 bg-background border-t border-[#e8e8e8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-ink-black mb-10 sm:mb-16 text-3xl sm:text-4xl md:text-5xl">
            {t("home.testimonials.title")}
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 sm:gap-8">
            <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-[12px] border border-border shadow-[0_8px_24px_rgba(0,0,0,0.5)] max-w-md text-start flex-1 min-w-[280px]">
              <div className="flex text-[#8c8c8c] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-ink-black text-base sm:text-lg italic mb-6">
                {t("home.testimonials.quote1")}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e8e8e8] rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdHxlbnwwfHx8fDE3Nzc4MTM5MTR8MA&ixlib=rb-4.1.0&q=80&w=200"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-ink-black">Layla H.</div>
                 
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground p-6 sm:p-8 rounded-[12px] border border-border shadow-[0_8px_24px_rgba(0,0,0,0.5)] max-w-md text-start flex-1 min-w-[280px]">
              <div className="flex text-[#8c8c8c] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-ink-black text-base sm:text-lg italic mb-6">
                {t("home.testimonials.quote2")}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#e8e8e8] rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Nzc4MTM5Mjh8MA&ixlib=rb-4.1.0&q=80&w=200"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-ink-black">Omar K.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 — Newsletter */}
      <section className="py-12 sm:py-16 md:py-24 bg-hero-noir border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-ink-black mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl">
            {t("home.newsletter.title")}
          </h2>
          <p className="text-mid-gray mb-6 sm:mb-8 text-sm sm:text-base">
            {t("home.newsletter.description")}
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!API_URL) {
                toast.error(t("home.newsletter.error"));
                return;
              }
              setNewsletterSubmitting(true);
              try {
                const res = await axios.post(`${API_URL}/newsletter/subscribe`, {
                  email: newsletterEmail,
                  source: "landing",
                });
                if (res.data?.already_subscribed) {
                  toast.success(t("home.newsletter.alreadySubscribed"));
                } else {
                  toast.success(t("home.newsletter.success"));
                }
                setNewsletterEmail("");
              } catch (err: unknown) {
                toast.error(getUserFacingErrorMessage(err, t("home.newsletter.error"), t));
              } finally {
                setNewsletterSubmitting(false);
              }
            }}
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder={t("home.newsletter.placeholder")}
              required
              disabled={newsletterSubmitting}
              {...formFieldDirProps(
                isRTL,
                "latin",
                "flex-1 bg-input text-foreground border border-border rounded-[8px] px-4 py-2.5 sm:py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 text-sm sm:text-base min-w-0",
              )}
            />
            <button
              type="submit"
              disabled={newsletterSubmitting}
              className="bg-primary text-primary-foreground font-medium px-6 sm:px-8 py-2.5 sm:py-3 rounded-[8px] hover:bg-accent transition-colors text-sm sm:text-base whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none"
            >
              {newsletterSubmitting ? t("home.newsletter.submitting") : t("home.newsletter.subscribe")}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
