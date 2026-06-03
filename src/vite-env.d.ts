/// <reference types="vite/client" />

/** App-specific `import.meta.env` keys (merged with Vite’s built-ins). */
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Public site origin for canonical URLs (e.g. https://theagencyjo.com). Used at build time in index.html. */
  readonly VITE_SITE_URL?: string;
  /** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). Optional — page tracking is disabled if unset. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

/** Ensures `import.meta.env` is typed when the Vite client types aren’t pulled in (e.g. missing tsconfig). */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
