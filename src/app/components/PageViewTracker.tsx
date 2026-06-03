import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView } from "../../lib/analytics";

/**
 * Subscribes to React Router location and reports page views for SPA navigations.
 */
export function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
