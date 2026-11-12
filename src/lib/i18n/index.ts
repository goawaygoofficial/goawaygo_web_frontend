import { REGION_CURRENCIES } from './regionCurrencies';

/**
 * The website's languages (4.7). Text is written in English in the code and wrapped in `t('English sentence {0}',
 * value)`; `messages/<code>.json` maps each English sentence to its translation (the same files as the app). A
 * sentence without a translation stays English. Changing the language reloads the screens (see LanguageRoot), so
 * `t` can be a plain function.
 */

export const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'ja', name: '日本語', dir: 'ltr' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'goawaygo.language';
const CURRENCY_KEY = 'goawaygo.currency';

const loaders = import.meta.glob<{ default: Record<string, string> }>('./messages/*.json');

let language: LanguageCode = 'en';
let accountCurrency: string | null = null;
let catalog: Record<string, string> = {};

export function isLanguage(code: string | null | undefined): code is LanguageCode {
  return LANGUAGES.some((l) => l.code === code);
}

/** The English sentence in the current language, with `{0}`, `{1}`... filled in. */
export function t(template: string, ...args: (string | number)[]): string {
  let text = catalog[template] ?? template;
  args.forEach((arg, i) => {
    text = text.replaceAll(`{${String(i)}}`, String(arg));
  });
  return text;
}

export function getLanguage(): LanguageCode {
  return language;
}

/**
 * The locale for dates, numbers and prices: the browser's own (e.g. `en-IN`) when it is in the same language,
 * so the region's formats are kept; otherwise the language.
 */
export function getLocale(): string {
  const browser = typeof navigator === 'undefined' ? '' : navigator.language;
  return browser.toLowerCase().startsWith(language) ? browser : language;
}

export function getDirection(): 'ltr' | 'rtl' {
  return LANGUAGES.find((l) => l.code === language)?.dir ?? 'ltr';
}

/** The visitor's choice, else the browser's first supported language, else English. */
export function detectLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage unavailable: use the browser's languages.
  }
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages;
  for (const tag of preferred) {
    const code = tag.slice(0, 2).toLowerCase();
    if (isLanguage(code)) return code;
  }
  return 'en';
}

/** Loads a language's translations and makes it current (also on `<html lang dir>`). */
export async function loadLanguage(code: LanguageCode): Promise<void> {
  const loader = loaders[`./messages/${code}.json`];
  catalog = code === 'en' || !loader ? {} : (await loader()).default;
  language = code;
  document.documentElement.lang = code;
  document.documentElement.dir = getDirection();
}

export function rememberLanguage(code: LanguageCode): void {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Private mode: the choice lasts for this visit.
  }
}

/** The signed-in account's currency (UserProvider keeps it current); null when signed out or not chosen. */
export function setAccountCurrency(code: string | null): void {
  accountCurrency = code;
}

/**
 * The currency prices are shown in: the account's, else the visitor's choice, else a guess from the browser's
 * region (en-IN → INR), else US dollars.
 */
export function getCurrency(): string {
  if (accountCurrency) return accountCurrency;
  try {
    const saved = localStorage.getItem(CURRENCY_KEY);
    if (saved && /^[A-Z]{3}$/.test(saved)) return saved;
  } catch {
    // Storage unavailable: guess.
  }
  const preferred = typeof navigator === 'undefined' ? [] : navigator.languages;
  for (const tag of preferred) {
    const region = tag.split('-')[1]?.toUpperCase();
    const currency = region ? REGION_CURRENCIES[region] : undefined;
    if (currency) return currency;
  }
  return 'USD';
}

/** A signed-out visitor's currency choice, kept in this browser. */
export function rememberCurrency(code: string): void {
  try {
    localStorage.setItem(CURRENCY_KEY, code);
  } catch {
    // Private mode: the choice lasts for this visit.
  }
}
