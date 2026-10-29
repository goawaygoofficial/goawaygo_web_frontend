import { useEffect, useId, useState } from 'react';
import { Icon } from '@/components';
import { searchPeople } from '../services/wanderbookService';
import type { Person } from '../types';
import { PersonRow } from './People';
import shared from './Wanderbook.module.css';
import styles from './WanderbookSearchBar.module.css';

const MIN_CHARS = 2;

/** Sticky gradient search pill: finds travellers by name and lists them under it. */
export function WanderbookSearchBar() {
  const id = useId();
  const [text, setText] = useState('');
  const [results, setResults] = useState<{ query: string; people: Person[] } | null>(null);
  const query = text.trim();

  useEffect(() => {
    if (query.length < MIN_CHARS) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      searchPeople(query, controller.signal)
        .then((people) => {
          setResults({ query, people });
        })
        .catch(() => {
          if (!controller.signal.aborted) setResults({ query, people: [] });
        });
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const shown = query.length >= MIN_CHARS && results ? results : null;

  return (
    <div className={styles.bar}>
      <div role="search" className={styles.pill}>
        <Icon name="search" className={styles.icon} />
        <label htmlFor={id} className="visually-hidden">
          Search travellers by name
        </label>
        <input
          id={id}
          type="search"
          placeholder="Search travellers"
          autoComplete="off"
          maxLength={50}
          value={text}
          className={styles.input}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
      </div>
      {shown && (
        <div className={styles.results} aria-live="polite">
          {shown.people.length === 0 ? (
            <p className={shared.muted}>No travellers found.</p>
          ) : (
            <ul className={shared.list} aria-label="Travellers">
              {shown.people.map((person) => (
                <PersonRow key={person.publicId} person={person} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
