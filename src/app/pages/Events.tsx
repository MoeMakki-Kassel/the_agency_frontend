import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import { MapPin, CalendarDays, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { formatEventDateTimeRange, interpolateTemplate, useAppLocale } from "../hooks/useAppLocale";
import { usePriceFormat } from "../hooks/usePriceFormat";
import { cn } from "../components/ui/utils";
import { formFieldDirProps } from "../utils/formFieldDir";

const API_URL = (import.meta as any).env.VITE_API_URL;

type EventItem = {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  date_time: string;
  end_date_and_time?: string | null;
  location_name?: string;
  cover_photo?: string;
  tiers?: Array<{ price: number }>;
};

type TimeFilter = "all" | "upcoming" | "thisWeek" | "thisMonth";
type SortBy = "dateAsc" | "dateDesc" | "priceAsc" | "priceDesc";

export function Events() {
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("dateAsc");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const locale = useAppLocale();
  const { formatFromPrice } = usePriceFormat();
  const searchLocale = language === "AR" ? "ar" : "en";

  const fold = (s: string) =>
    s.normalize("NFC").toLocaleLowerCase(searchLocale);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/events`);
        setEvents(res.data.data ?? []);
      } catch {
        toast.error(t("events.toast.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
    // Mount-only fetch; avoid [t] — it changes identity each provider render and would refetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const locations = useMemo(() => {
    const unique = new Set(
      events.map((event) => event.location_name).filter(Boolean) as string[],
    );
    return ["all", ...Array.from(unique)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(now.getDate() + 7);
    const monthFromNow = new Date(now);
    monthFromNow.setMonth(now.getMonth() + 1);

    const q = search.trim();
    const qFold = q ? fold(q) : "";

    return events.filter((event) => {
      const eventDate = new Date(event.date_time);

      const matchesSearch =
        !qFold ||
        fold(event.title).includes(qFold) ||
        fold(event.subtitle || "").includes(qFold) ||
        fold(event.location_name || "").includes(qFold);

      const matchesLocation =
        locationFilter === "all" || event.location_name === locationFilter;

      const matchesTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && eventDate >= now) ||
        (timeFilter === "thisWeek" &&
          eventDate >= now &&
          eventDate <= weekFromNow) ||
        (timeFilter === "thisMonth" &&
          eventDate >= now &&
          eventDate <= monthFromNow);

      return matchesSearch && matchesLocation && matchesTime;
    });
  }, [events, search, locationFilter, timeFilter, searchLocale]);

  useEffect(() => {
    setPage(1);
  }, [search, locationFilter, timeFilter, sortBy]);

  const sortedEvents = useMemo(() => {
    const getLowestPrice = (event: EventItem) =>
      event.tiers?.length
        ? Math.min(...event.tiers.map((tier) => tier.price))
        : Number.MAX_SAFE_INTEGER;

    const next = [...filteredEvents];
    next.sort((a, b) => {
      const dateA = new Date(a.date_time).getTime();
      const dateB = new Date(b.date_time).getTime();
      const priceA = getLowestPrice(a);
      const priceB = getLowestPrice(b);

      switch (sortBy) {
        case "dateDesc":
          return dateB - dateA;
        case "priceAsc":
          return priceA - priceB;
        case "priceDesc":
          return priceB - priceA;
        case "dateAsc":
        default:
          return dateA - dateB;
      }
    });
    return next;
  }, [filteredEvents, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / pageSize));
  const pagedEvents = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sortedEvents.slice(start, start + pageSize);
  }, [sortedEvents, page, totalPages]);

  const timeLabel = (v: TimeFilter) =>
    ({
      all: t("events.time.all"),
      upcoming: t("events.time.upcoming"),
      thisWeek: t("events.time.thisWeek"),
      thisMonth: t("events.time.thisMonth"),
    })[v];

  const sortLabel = (v: SortBy) =>
    ({
      dateAsc: t("events.sort.dateAsc"),
      dateDesc: t("events.sort.dateDesc"),
      priceAsc: t("events.sort.priceAsc"),
      priceDesc: t("events.sort.priceDesc"),
    })[v];

  const fromIdx = (page - 1) * pageSize + 1;
  const toIdx = Math.min(page * pageSize, sortedEvents.length);

  const fdField = formFieldDirProps(isRTL, "text");

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-hero-noir text-white py-14 sm:py-16 md:py-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6">
            <ArrowLeft size={18} /><span className="text-sm font-medium">{t("common.back")}</span>
          </button>
         
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-['Tajawal'] mb-3 sm:mb-4 text-start">
            {t("events.hero.title")}
          </h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl text-start text-pretty">
            {t("events.hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 sm:mb-8 min-w-0">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("events.search.placeholder")}
              lang={language === "AR" ? "ar" : "en"}
              dir={fdField.dir}
              className={cn(
                "md:col-span-2 border border-border rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0",
                fdField.className,
              )}
            />

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              aria-label={t("events.aria.timeFilter")}
              dir={fdField.dir}
              className={cn(
                "border border-border rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0 bg-input text-foreground",
                fdField.className,
              )}
            >
              {(["all", "upcoming", "thisWeek", "thisMonth"] as const).map(
                (v) => (
                  <option key={v} value={v}>
                    {timeLabel(v)}
                  </option>
                ),
              )}
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label={t("events.aria.locationFilter")}
              dir={fdField.dir}
              className={cn(
                "border border-border rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0 bg-input text-foreground",
                fdField.className,
              )}
            >
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location === "all" ? t("events.location.all") : location}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              aria-label={t("events.aria.sortBy")}
              dir={fdField.dir}
              className={cn(
                "border border-border rounded-lg px-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0 bg-input text-foreground",
                fdField.className,
              )}
            >
              {(
                [
                  "dateAsc",
                  "dateDesc",
                  "priceAsc",
                  "priceDesc",
                ] as const
              ).map((v) => (
                <option key={v} value={v}>
                  {sortLabel(v)}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="text-[#666] text-start">{t("events.loading")}</p>
          ) : sortedEvents.length === 0 ? (
            <p className="text-[#666] text-start">{t("events.empty")}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {pagedEvents.map((event) => {
                  const formattedDate = formatEventDateTimeRange(
                    event.date_time,
                    event.end_date_and_time,
                    locale,
                    { dateStyle: "medium", timeStyle: "short" },
                  );
                  const lowestPrice = event.tiers?.length
                    ? Math.min(...event.tiers.map((tier) => tier.price))
                    : null;
                  const slugOrId = event.slug || event.id;

                  return (
                    <div
                      key={event.id}
                      className="group bg-card rounded-[12px] overflow-hidden border border-border shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1"
                    >
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={event.cover_photo}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 sm:p-5">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1 line-clamp-1 text-start">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-sm text-[#666] mb-3 line-clamp-1 text-start">
                            {event.subtitle}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[#666] text-xs sm:text-sm mb-2 min-w-0">
                          <CalendarDays className="w-4 h-4 shrink-0" />
                          <span className="min-w-0 text-start">
                            {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[#666] text-xs sm:text-sm mb-4 min-w-0">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="min-w-0 text-start">
                            {event.location_name || "—"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 min-w-0">
                          <span className="font-bold text-foreground text-sm sm:text-base tabular-nums text-start min-w-0">
                            {lowestPrice != null ? formatFromPrice(lowestPrice) : "—"}
                          </span>
                          <div className="flex gap-2 min-w-0">
                            <Link
                              to={`/event/${slugOrId}#event-reserve`}
                              className="flex-1 text-center px-2 sm:px-3 py-2 rounded-lg bg-black text-white hover:bg-[#525252] transition-colors text-xs sm:text-sm whitespace-nowrap min-w-0"
                            >
                              {t("events.bookNow")}
                            </Link>
                            <Link
                              to={`/event/${slugOrId}`}
                              className="shrink-0 px-3 sm:px-4 py-2 rounded-lg bg-muted/30 text-ink-black font-medium hover:bg-muted/50 transition-colors text-xs sm:text-sm whitespace-nowrap"
                            >
                              {t("events.details")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0">
                <p className="text-xs sm:text-sm text-[#666] text-start sm:max-w-[55%]">
                  {interpolateTemplate(
                    t("events.pagination.summary"),
                    { a: fromIdx, b: toIdx, c: sortedEvents.length },
                    { locale },
                  )}
                </p>
                <div
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 min-w-0"
                  dir="ltr"
                >
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5]"
                  >
                    {t("events.pagination.prev")}
                  </button>
                  <span className="text-xs sm:text-sm text-[#666] whitespace-nowrap tabular-nums">
                    {interpolateTemplate(
                      t("events.pagination.page"),
                      { n: page, d: totalPages },
                      { locale },
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 sm:px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f5f5f5]"
                  >
                    {t("events.pagination.next")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
