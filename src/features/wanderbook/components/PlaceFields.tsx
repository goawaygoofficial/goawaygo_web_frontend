import { useEffect, useState } from 'react';
import { suggestPlaces } from '@/features/discover';
import type { Place } from '@/features/discover';
import type { PlaceTag } from '../types';
import shared from './Wanderbook.module.css';
import styles from './PlaceFields.module.css';
import { t } from '@/lib/i18n';

interface PlaceFieldsProps {
  value: PlaceTag | null;
  onChange: (place: PlaceTag | null) => void;
  /** Shown when the place came from the photo's location. */
  fromPhoto?: boolean;
}

/**
 * The post's place tag: place, state and country (names only). Filled in from the photo's location when it has
 * one; the user can search for another place, type it, or remove it.
 */
export function PlaceFields({ value, onChange, fromPhoto = false }: PlaceFieldsProps) {
  const [search, setSearch] = useState('');
  const [found, setFound] = useState<{ query: string; places: Place[] } | null>(null);
  const query = search.trim();

  useEffect(() => {
    if (query.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      suggestPlaces(query, controller.signal)
        .then((places) => {
          setFound({ query, places });
        })
        .catch(() => {
          // Typing the names by hand still works.
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const set = (field: keyof PlaceTag, text: string) => {
    const next = { name: '', region: '', country: '', ...value, [field]: text };
    onChange(next.name || next.region || next.country ? next : null);
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={shared.fieldLabel}>{t('Place')}</legend>
      {fromPhoto && value && (
        <p className={shared.muted}>
          {t("From your photo's location. Change it if it isn't right.")}
        </p>
      )}
      <label className={shared.field}>
        <span className="visually-hidden">{t('Find a place')}</span>
        <input
          type="search"
          placeholder={t('Find a place')}
          maxLength={100}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        />
      </label>
      {found && query.length >= 2 && found.places.length > 0 && (
        <ul className={styles.suggestions}>
          {found.places.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => {
                  onChange({
                    name: place.name,
                    region: place.type === 'region' ? '' : place.region,
                    country: place.type === 'country' ? '' : place.country,
                  });
                  setSearch('');
                }}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.row}>
        {(
          [
            ['name', t('Place'), 200],
            ['region', t('State or region'), 200],
            ['country', t('Country'), 100],
          ] as const
        ).map(([field, label, max]) => (
          <label key={field} className={shared.field}>
            <span className={shared.muted}>{label}</span>
            <input
              maxLength={max}
              value={value?.[field] ?? ''}
              onChange={(event) => {
                set(field, event.target.value);
              }}
            />
          </label>
        ))}
      </div>
      {value && (
        <button
          type="button"
          className={styles.remove}
          onClick={() => {
            onChange(null);
          }}
        >
          {t('Remove place')}
        </button>
      )}
    </fieldset>
  );
}
