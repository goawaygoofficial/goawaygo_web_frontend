import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { TextField } from '@/components';
import styles from './SuggestField.module.css';

/** Wait this long after the last key press before asking for suggestions. */
const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

export interface Suggestion {
  key: string;
  title: string;
  context: string;
  icon: ReactNode;
}

interface SuggestFieldProps<T> {
  label: string;
  placeholder: string;
  icon: ReactNode;
  /** The text in the field (the picked item's label once one is picked). */
  text: string;
  onTextChange: (text: string) => void;
  suggest: (text: string, signal: AbortSignal) => Promise<T[]>;
  describe: (item: T) => Suggestion;
  onPick: (item: T) => void;
}

/**
 * A form field that suggests real places while typing (airports and cities, or destinations). Picking one fills
 * the field; typing again clears the pick, so the form knows whether a suggestion was chosen.
 */
export function SuggestField<T>({
  label,
  placeholder,
  icon,
  text,
  onTextChange,
  suggest,
  describe,
  onPick,
}: SuggestFieldProps<T>) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = text.trim();

  useEffect(() => {
    if (!open || query.length < MIN_CHARS) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      suggest(query, controller.signal)
        .then((items) => {
          setSuggestions(items);
          setActive(-1);
        })
        // Suggestions are a help: without them the form says what is missing.
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, suggest]);

  const showList = open && suggestions.length > 0 && query.length >= MIN_CHARS;

  const pick = (item: T) => {
    onPick(item);
    setOpen(false);
  };

  return (
    <div className={styles.field}>
      <TextField
        label={label}
        placeholder={placeholder}
        tone="tinted"
        icon={icon}
        value={text}
        autoComplete="off"
        maxLength={100}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? `${listId}-${String(active)}` : undefined}
        onChange={(event) => {
          onTextChange(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
        }}
        onKeyDown={(event) => {
          if (!showList) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActive((value) => (value + 1) % suggestions.length);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActive((value) => (value <= 0 ? suggestions.length - 1 : value - 1));
          } else if (event.key === 'Enter' && active >= 0) {
            event.preventDefault();
            const item = suggestions[active];
            if (item !== undefined) pick(item);
          } else if (event.key === 'Escape') {
            setOpen(false);
          }
        }}
      />
      <ul
        id={listId}
        role="listbox"
        aria-label={`Suggestions for ${label}`}
        className={styles.list}
        hidden={!showList}
      >
        {suggestions.map((item, index) => {
          const shown = describe(item);
          return (
            <li
              key={shown.key}
              id={`${listId}-${String(index)}`}
              role="option"
              aria-selected={index === active}
              className={[styles.option, index === active && styles.optionActive]
                .filter(Boolean)
                .join(' ')}
              // mousedown, so the field doesn't lose focus (and close the list) before the click lands
              onMouseDown={(event) => {
                event.preventDefault();
                pick(item);
              }}
            >
              {shown.icon}
              <span className={styles.optionText}>
                <span className={styles.optionName}>{shown.title}</span>
                <span className={styles.optionContext}>{shown.context}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
