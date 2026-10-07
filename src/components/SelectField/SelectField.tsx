import { useId } from 'react';
import type { ReactNode } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';

interface SelectFieldProps<T extends string> {
  label: string;
  icon?: ReactNode;
  options: readonly T[];
  value: T | '';
  placeholder: string;
  onChange: (value: T) => void;
}

export function SelectField<T extends string>({
  label,
  icon,
  options,
  value,
  placeholder,
  onChange,
}: SelectFieldProps<T>) {
  const id = useId();
  return (
    <FieldShell tone="tinted" icon={icon} caption={<label htmlFor={id}>{label}</label>}>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option === event.target.value);
          if (next !== undefined) onChange(next);
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
