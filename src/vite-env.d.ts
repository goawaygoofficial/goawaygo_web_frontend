/// <reference types="vite/client" />

/** Commit the build came from (Cloudflare Pages sets CF_PAGES_COMMIT_SHA), or "local". See vite.config.ts. */
declare const __APP_RELEASE__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
