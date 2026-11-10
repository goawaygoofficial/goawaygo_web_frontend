import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { getLanguage, loadLanguage, rememberLanguage } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/i18n';
import { getAccessToken, onSessionChange } from '@/lib/session';
import { LanguageContext } from './LanguageContext';

/** The account's language, for its pushes and emails. Best effort: the site works without it. */
function tellAccount(code: LanguageCode): void {
  if (getAccessToken() === null) return;
  apiRequest<unknown>('/api/users/me/language', {
    method: 'PUT',
    body: { language: code },
    fallbackError: 'Could not save your language.',
  }).catch(() => undefined);
}

/**
 * Holds the language (loaded before the first render, see main.tsx). `children` is rendered with the language as
 * its key, so changing it re-renders every screen with the new texts (the session and the page stay).
 */
export function LanguageRoot({ children }: { children: (language: LanguageCode) => ReactNode }) {
  const [language, setCurrent] = useState<LanguageCode>(getLanguage);

  // After signing in on a browser set to another language, the account follows this browser.
  useEffect(
    () =>
      onSessionChange((user) => {
        if (user?.language !== undefined && user.language !== getLanguage())
          tellAccount(getLanguage());
      }),
    [],
  );

  const setLanguage = useCallback(async (code: LanguageCode) => {
    await loadLanguage(code);
    rememberLanguage(code);
    tellAccount(code);
    setCurrent(code);
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children(language)}</LanguageContext.Provider>;
}
