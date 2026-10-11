import { useId, useRef } from 'react';
import { Icon } from '../Icon/Icon';
import { FieldShell } from '../FieldShell/FieldShell';
import { addDays, toIsoDate } from '@/lib/date';
import styles from './DateField.module.css';

/** How far ahead dates can be picked, matching the app (today → +365 days). */
const MAX_DAYS_AHEAD = 365;

interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`, or empty when unset. */
  value: string;
  onChange: (value: string) => void;
}

/**
 * Looks like the app's date field: shows the label ("Departure") until a date is picked, then the date as
 * `YYYY-MM-DD`. A click anywhere opens the browser's date picker (today → +365 days); the native input stays
 * underneath for keyboard and screen-reader users.
 */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const today = new Date();

  const openPicker = () => {
    try {
      inputRef.current?.showPicker();
    } catch {
      // Not allowed or unsupported here: the input still takes focus and keyboard input.
    }
  };

  return (
    <FieldShell tone="tinted" icon={<Icon name="calendar_today" />} className={styles.field}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className={value ? styles.value : styles.placeholder} aria-hidden="true">
        {value || label}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="date"
        className={styles.input}
        value={value}
        min={toIsoDate(today)}
        max={toIsoDate(addDays(today, MAX_DAYS_AHEAD))}
        onClick={openPicker}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </FieldShell>
  );
}
