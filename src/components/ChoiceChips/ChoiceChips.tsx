import { useId } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './ChoiceChips.module.css';

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

interface ChoiceChipsProps<T extends string> {
  /** Accessible name of the group. */
  legend: string;
  options: readonly ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Single-choice chips backed by native radio inputs (keyboard and screen-reader friendly). Styled like the app's
 * Material 3 `ChoiceChip`: rounded rectangle, outlined when off, filled with a check mark when selected.
 */
export function ChoiceChips<T extends string>({
  legend,
  options,
  value,
  onChange,
}: ChoiceChipsProps<T>) {
  const name = useId();
  return (
    <fieldset className={styles.group}>
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.chip}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => {
              onChange(option.value);
            }}
          />
          <span>
            {option.value === value && <Icon name="check" className={styles.check} />}
            {option.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
