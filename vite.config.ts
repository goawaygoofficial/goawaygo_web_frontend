import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import type { ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `npm run dev:dev-api`: the local website against the dev API (api-dev.goawaygo.com), without running the backend.
 * The API accepts only the dev website's origin, so the dev server forwards `/api` itself, without the browser's
 * Origin header. Signing in doesn't work this way (the sign-in cookie belongs to goawaygo.com); everything
 * signed out does.
 */
const DEV_API = 'https://api-dev.goawaygo.com';

export default defineConfig(({ mode }) => {
  const devApi = mode === 'dev-api';
  if (devApi) {
    // Same origin: requests go to this dev server, which forwards them (wins over .env).
    process.env.VITE_API_BASE_URL = '';
  }
  const proxy: Record<string, ProxyOptions> | undefined = devApi
    ? {
        '/api': {
          target: DEV_API,
          changeOrigin: true,
          configure: (server) => {
            server.on('proxyReq', (request) => {
              request.removeHeader('origin');
            });
          },
        },
      }
    : undefined;

  return {
    plugins: [react()],
    // The version (built once by the Release workflow) or the commit Cloudflare Pages is building, so errors in
    // Sentry show which release they came from.
    define: {
      __APP_RELEASE__: JSON.stringify(
        process.env.APP_VERSION ?? process.env.CF_PAGES_COMMIT_SHA ?? 'local',
      ),
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { proxy },
  };
});
