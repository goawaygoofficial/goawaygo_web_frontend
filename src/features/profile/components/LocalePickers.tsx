import { useEffect, useId, useState } from 'react';
import { getCurrency, LANGUAGES, rememberCurrency, t } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/i18n';
import { useLanguage } from '@/providers';
import { getRegions } from '../services/accountService';
import type { CurrencyOption } from '../types';
import styles from './LocalePickers.module.css';

/**
 * Language for everyone, and (signed out) the currency prices are shown in; a signed-in account's currency is in
 * User Profile.
 */
export function LocalePickers({ currency }: { currency: boolean }) {
  const { language, setLanguage } = useLanguage();
  const languageId = useId();
  const currencyId = useId();
  const [currencies, setCurrencies] = useState<CurrencyOption[] | null>(null);
  const [chosen, setChosen] = useState(getCurrency);

  useEffect(() => {
    if (!currency) return;
    let active = true;
    getRegions().then(
      (regions) => {
        if (active) setCurrencies(regions.currencies);
      },
      () => {
        // Without the list, the current currency still shows.
      },
    );
    return () => {
      active = false;
    };
  }, [currency]);

  return (
    <div className={styles.pickers}>
      <label className={styles.picker} htmlFor={languageId}>
        <span className={styles.label}>{t('Language')}</span>
        <select
          id={languageId}
          className={styles.select}
          value={language}
          onChange={(event) => {
            void setLanguage(event.target.value as LanguageCode);
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} lang={l.code}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      {currency && (
        <label className={styles.picker} htmlFor={currencyId}>
          <span className={styles.label}>{t('Currency')}</span>
          <select
            id={currencyId}
            className={styles.select}
            value={chosen}
            onChange={(event) => {
              rememberCurrency(event.target.value);
              setChosen(event.target.value);
            }}
          >
            {(currencies ?? [{ code: chosen, name: chosen, symbol: chosen }]).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code === c.name ? c.code : `${c.code} · ${c.name}`}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
