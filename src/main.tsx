import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { App } from '@/app/App';
import { CrashFallback } from '@/app/CrashFallback';
import { initMonitoring } from '@/lib/monitoring';
// Roboto, the app's (Android) font, bundled with the site: no request to a third-party font server.
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import '@/styles/global.css';

initMonitoring();

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element in index.html.');

createRoot(container).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<CrashFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
