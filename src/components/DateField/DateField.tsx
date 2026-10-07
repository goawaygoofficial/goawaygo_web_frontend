import { useId } from 'react';
import { CalendarDays } from 'lucide-react';
import { FieldShell } from '../FieldShell/FieldShell';
import { addDays, toIsoDate } from '@/lib/date';

/** How far ahead dates can be picked, matching the app (today → +365 days). */
const MAX_DAYS_AHEAD = 365;

interface DateFieldProps {
  label: string;
  /** `YYYY-MM-DD`, or empty when unset. */
  value: string;
  onChange: (value: string) => void;
}

/** Native date input with a dark-themed picker, limited to today → +365 days. Value is `YYYY-MM-DD`. */
export function DateField({ label, value, onChange }: DateFieldProps) {
  const id = useId();
  const today = new Date();
  return (
    <FieldShell tone="tinted" icon={<CalendarDays />} caption={<label htmlFor={id}>{label}</label>}>
      <input
        id={id}
        type="date"
        value={value}
        min={toIsoDate(today)}
        max={toIsoDate(addDays(today, MAX_DAYS_AHEAD))}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </FieldShell>
  );
}
