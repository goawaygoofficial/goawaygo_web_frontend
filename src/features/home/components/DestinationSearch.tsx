import { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, TextField } from '@/components';
import { suggestPlaces } from '@/features/discover';
import type { Place } from '@/features/discover';
import { routes } from '@/lib/routes';
import { track } from '@/lib/analytics';
import styles from './DestinationSearch.module.css';

/** Wait this long after the last key press before asking for suggestions. */
const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

/** "Jaipur, Rajasthan, India" → "Rajasthan, India" (the name is shown separately). */
function placeContext(place: Place): string {
  const prefix = `${place.name}, `;
  return place.label.startsWith(prefix) ? place.label.slice(prefix.length) : place.label;
}

/**
 * "Where do you want to be?" with real places suggested while typing (countries, regions, cities, landmarks).
 * Picking one opens exactly that place; pressing Search without picking opens the best match for the text.
 */
export function DestinationSearch() {
  const navigate = useNavigate();
  const listId = useId();
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = text.trim();

  useEffect(() => {
    // Shorter text shows no list (see showList), so nothing to ask for.
    if (query.length < MIN_CHARS) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      suggestPlaces(query, controller.signal)
        .then((places) => {
          setSuggestions(places);
          setActive(-1);
        })
        // Suggestions are a help, not required: Search still works without them.
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        });
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const showList = open && suggestions.length > 0 && query.length >= MIN_CHARS;

  const openPlace = (place: Place) => {
    track({ name: 'destination_searched' });
    setOpen(false);
    void navigate(routes.destination(place.name, { id: place.id }));
  };

  return (
    <form
      role="search"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const picked = showList ? suggestions[active] : undefined;
        if (picked) {
          openPlace(picked);
        } else if (query.length >= MIN_CHARS) {
          track({ name: 'destination_searched' });
          void navigate(routes.destination(query));
        }
      }}
    >
      <div className={styles.field}>
        <TextField
          label="Destination"
          placeholder="Where do you want to be?"
          tone="accent"
          icon={<Icon name="public" />}
          value={text}
          autoComplete="off"
          maxLength={100}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={
            showList && active >= 0 ? `${listId}-${String(active)}` : undefined
          }
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
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
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        <ul
          id={listId}
          role="listbox"
          aria-label="Suggested places"
          className={styles.list}
          hidden={!showList}
        >
          {suggestions.map((place, index) => (
            <li
              key={place.id}
              id={`${listId}-${String(index)}`}
              role="option"
              aria-selected={index === active}
              className={[styles.option, index === active && styles.optionActive]
                .filter(Boolean)
                .join(' ')}
              // mousedown, so the field doesn't lose focus (and close the list) before the click lands
              onMouseDown={(event) => {
                event.preventDefault();
                openPlace(place);
              }}
            >
              <Icon name={place.type === 'country' ? 'public' : 'location_on_outlined'} />
              <span className={styles.optionText}>
                <span className={styles.optionName}>{place.name}</span>
                <span className={styles.optionContext}>{placeContext(place)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Button type="submit" className={styles.submit}>
        Search
      </Button>
    </form>
  );
}
