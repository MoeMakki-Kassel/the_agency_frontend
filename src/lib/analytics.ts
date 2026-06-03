/**
 * Page view tracking:
 * - Google Analytics 4 (optional): set VITE_GA_MEASUREMENT_ID=G-xxxxxxxxxx
 * - Backend counter: POST /analytics/page-views to VITE_API_URL (same DB totals as admin analytics)
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

function ensureGtag(): void {
  if (!GA_ID || typeof window === "undefined" || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

async function recordBackendPageView(path: string): Promise<void> {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  const base = raw?.replace(/\/$/, "");
  if (!base) return;

  const safePath = path.length > 2048 ? path.slice(0, 2048) : path;

  try {
    await fetch(`${base}/analytics/page-views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: safePath }),
      keepalive: true,
      credentials: "omit",
    });
  } catch {
    // offline / CORS misconfig — ignore
  }
}

/** SPA navigation: optional GA + always POST page view to the_agency_backend (when VITE_API_URL is set). */
export function trackPageView(pagePathWithSearch: string): void {
  const path =
    pagePathWithSearch.startsWith("/") ? pagePathWithSearch : `/${pagePathWithSearch}`;

  if (GA_ID?.trim()) {
    ensureGtag();
    if (window.gtag) {
      window.gtag("config", GA_ID, {
        page_path: path,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }

  void recordBackendPageView(path);
}
