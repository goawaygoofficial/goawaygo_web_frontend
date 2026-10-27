import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import type { ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `npm run dev:staging-api`: the local website against the staging API, without running the backend. The API
 * accepts only the staging website's origin, so the dev server forwards `/api` itself, without the browser's
 * Origin header. Signing in doesn't work this way (the sign-in cookie belongs to goawaygo.com); everything
 * signed out does.
 */
const STAGING_API = 'https://api.goawaygo.com';

export default defineConfig(({ mode }) => {
  const stagingApi = mode === 'staging-api';
  if (stagingApi) {
    // Same origin: requests go to this dev server, which forwards them (wins over .env).
    process.env.VITE_API_BASE_URL = '';
  }
  const proxy: Record<string, ProxyOptions> | undefined = stagingApi
    ? {
        '/api': {
          target: STAGING_API,
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
    // The commit Cloudflare Pages is building, so errors in Sentry show which release they came from.
    define: {
      __APP_RELEASE__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA ?? 'local'),
    },
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { proxy },
  };
});
