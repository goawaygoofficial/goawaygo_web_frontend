import { useId } from 'react';
import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { FieldShell } from '../FieldShell/FieldShell';
import styles from './CounterField.module.css';

interface CounterFieldProps {
  label: string;
  icon: ReactNode;
  value: number;
  onChange: (value: number) => void;
}

/** Numeric field with − / + controls. The value never goes below 0. */
export function CounterField({ label, icon, value, onChange }: CounterFieldProps) {
  const id = useId();
  const set = (next: number) => {
    onChange(Number.isFinite(next) ? Math.max(0, Math.trunc(next)) : 0);
  };

  return (
    <FieldShell
      tone="tinted"
      density="compact"
      icon={icon}
      caption={<label htmlFor={id}>{label}</label>}
    >
      <button
        type="button"
        className={styles.step}
        aria-label={`Decrease ${label.toLowerCase()}`}
        disabled={value <= 0}
        onClick={() => {
          set(value - 1);
        }}
      >
        <Icon name="remove" />
      </button>
      <input
        id={id}
        className={styles.value}
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(event) => {
          set(event.target.valueAsNumber);
        }}
      />
      <button
        type="button"
        className={styles.step}
        aria-label={`Increase ${label.toLowerCase()}`}
        onClick={() => {
          set(value + 1);
        }}
      >
        <Icon name="add" />
      </button>
    </FieldShell>
  );
}
