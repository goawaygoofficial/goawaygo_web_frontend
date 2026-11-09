import { createContext } from 'react';
import type { LanguageCode } from '@/lib/i18n';

export interface LanguageContextValue {
  language: LanguageCode;
  /** Loads the language, remembers it (and tells the account when signed in), then reloads the screens in it. */
  setLanguage: (code: LanguageCode) => Promise<void>;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
