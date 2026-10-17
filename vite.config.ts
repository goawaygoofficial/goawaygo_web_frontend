import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The commit Cloudflare Pages is building, so errors in Sentry show which release they came from.
  define: {
    __APP_RELEASE__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA ?? 'local'),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
