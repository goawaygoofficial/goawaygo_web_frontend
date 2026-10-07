import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { FieldShell } from '../FieldShell/FieldShell';
import type { FieldTone } from '../FieldShell/FieldShell';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Accessible label. Visually hidden — the placeholder is the visible hint, as in the app. */
  label: string;
  tone?: FieldTone;
  icon?: ReactNode;
  className?: string;
}

export function TextField({ label, tone = 'solid', icon, className, id, ...rest }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell tone={tone} icon={icon} className={className}>
      <label htmlFor={inputId} className="visually-hidden">
        {label}
      </label>
      <input id={inputId} {...rest} />
    </FieldShell>
  );
}
