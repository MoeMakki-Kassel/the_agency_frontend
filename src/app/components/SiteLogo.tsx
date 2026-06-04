import { useEffect, useState } from "react";
import fallbackLogo from "../../imports/logo_theagencyjo.png";
import { cn } from "./ui/utils";

const API_URL = import.meta.env.VITE_API_URL;

type SiteLogoProps = {
  /** default: light UI (navbar, light footer). onDark: dark hero / overlays — uses logo_url_dark or inverted fallback. */
  variant?: "default" | "onDark";
  className?: string;
  alt?: string;
};

export function SiteLogo({ variant = "default", className = "", alt = "TheAgencyJo." }: SiteLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!API_URL) return;
      try {
        const res = await fetch(`${API_URL}/settings/public`);
        const data = await res.json();
        if (!res.ok || !mounted) return;
        const lu = typeof data.logo_url === "string" ? data.logo_url.trim() : "";
        const ld = typeof data.logo_url_dark === "string" ? data.logo_url_dark.trim() : "";
        setLogoUrl(lu || null);
        setLogoDarkUrl(ld || null);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onDark = variant === "onDark";
  const src = logoDarkUrl && onDark ? logoDarkUrl : logoUrl || fallbackLogo;
  const invertFallback = onDark && !logoDarkUrl;

  return (
    <img
      src={src}
      alt={alt}
      // Preload hint so the logo renders ASAP on the first paint
      loading="eager"
      decoding="async"
      // cn() runs the resulting classes through tailwind-merge so a height in
      // `className` overrides the default `h-10` instead of fighting it.
      className={cn(
        "h-10 w-auto object-contain",
        invertFallback && "brightness-0 invert",
        className,
      )}
    />
  );
}
