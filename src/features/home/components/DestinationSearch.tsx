import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { routes } from '@/lib/routes';
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
        if (trimmed.length > 0) void navigate(routes.destination(trimmed));
      }}
    >
      <TextField
        label="Destination"
        placeholder="Where do you want to be?"
        tone="accent"
        icon={<Globe />}
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
