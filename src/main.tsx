import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { App } from '@/app/App';
import { CrashFallback } from '@/app/CrashFallback';
import { initAnalytics } from '@/lib/analytics';
import { detectLanguage, loadLanguage } from '@/lib/i18n';
import { initMonitoring } from '@/lib/monitoring';
import { LanguageRoot } from '@/providers';
// Roboto, the app's (Android) font, bundled with the site: no request to a third-party font server.
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import '@/styles/global.css';

initMonitoring();
initAnalytics();

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element in index.html.');

// The language's texts load before the first render, so nothing flashes in English.
void loadLanguage(detectLanguage())
  .catch(() => loadLanguage('en'))
  .finally(() => {
    createRoot(container).render(
      <StrictMode>
        <Sentry.ErrorBoundary fallback={<CrashFallback />}>
          <LanguageRoot>{(language) => <App key={language} />}</LanguageRoot>
        </Sentry.ErrorBoundary>
      </StrictMode>,
    );
  });
