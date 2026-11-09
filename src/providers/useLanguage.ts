import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import type { LanguageContextValue } from './LanguageContext';

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageRoot.');
  return value;
}
