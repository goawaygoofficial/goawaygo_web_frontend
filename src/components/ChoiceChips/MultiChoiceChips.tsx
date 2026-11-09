import { Icon } from '../Icon/Icon';
import styles from './ChoiceChips.module.css';
import { t } from '@/lib/i18n';

interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

interface MultiChoiceChipsProps<T extends string> {
  /** Accessible name of the group. */
  legend: string;
  options: readonly ChoiceOption<T>[];
  value: readonly T[];
  onChange: (value: T[]) => void;
  /** Most chips that can be on at once; the others are disabled when it is reached. */
  max?: number;
}

/** Like {@link ChoiceChips}, but any number can be on (native checkboxes). */
export function MultiChoiceChips<T extends string>({
  legend,
  options,
  value,
  onChange,
  max,
}: MultiChoiceChipsProps<T>) {
  const full = max !== undefined && value.length >= max;
  return (
    <fieldset className={styles.group}>
      <legend className="visually-hidden">{legend}</legend>
      {options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label key={option.value} className={styles.chip}>
            <input
              type="checkbox"
              value={option.value}
              checked={checked}
              disabled={!checked && full}
              onChange={() => {
                onChange(
                  checked ? value.filter((v) => v !== option.value) : [...value, option.value],
                );
              }}
            />
            <span>
              {checked && <Icon name="check" className={styles.check} />}
              {t(option.label)}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
