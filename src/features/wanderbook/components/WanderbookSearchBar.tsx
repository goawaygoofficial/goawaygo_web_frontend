import { Icon } from '@/components';
import { useId } from 'react';
import styles from './WanderbookSearchBar.module.css';

interface WanderbookSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Sticky gradient search pill. Filters the visible posts by destination. */
export function WanderbookSearchBar({ value, onChange }: WanderbookSearchBarProps) {
  const id = useId();
  return (
    <div className={styles.bar}>
      <div role="search" className={styles.pill}>
        <Icon name="search" className={styles.icon} />
        <label htmlFor={id} className="visually-hidden">
          Search posts by destination
        </label>
        <input
          id={id}
          type="search"
          placeholder="Destination"
          autoComplete="off"
          value={value}
          className={styles.input}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />
      </div>
    </div>
  );
}
