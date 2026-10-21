import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, TextField } from '@/components';
import { routes } from '@/lib/routes';
import { track } from '@/lib/analytics';
import styles from './DestinationSearch.module.css';

/** "Where do you want to be?" — opens the destination info page for the typed place. */
export function DestinationSearch() {
  const navigate = useNavigate();
  const [place, setPlace] = useState('');

  return (
    <form
      role="search"
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = place.trim();
        if (trimmed.length > 0) {
          track({ name: 'destination_searched' });
          void navigate(routes.destination(trimmed));
        }
      }}
    >
      <TextField
        label="Destination"
        placeholder="Where do you want to be?"
        tone="accent"
        icon={<Icon name="public" />}
        value={place}
        autoComplete="off"
        onChange={(event) => {
          setPlace(event.target.value);
        }}
      />
      <Button type="submit" className={styles.submit}>
        Search
      </Button>
    </form>
  );
}
