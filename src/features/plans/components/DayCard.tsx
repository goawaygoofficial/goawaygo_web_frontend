import { useState } from 'react';
import { Button } from '@/components';
import { formatDay, formatPrice } from '@/features/book';
import type { DayPlan, Slot } from '../types';
import styles from './PlanCards.module.css';
import { t } from '@/lib/i18n';

interface DayCardProps {
  day: DayPlan;
  currency: string;
  /** Given for the plan's owner: rewrites this day, optionally following a wish. */
  onChange?: (wish: string) => Promise<void>;
}

const PARTS = [
  ['morning', 'Morning'],
  ['afternoon', 'Afternoon'],
  ['evening', 'Evening'],
] as const;

/** One day of a plan: an orange header with the date and title, morning, afternoon and evening, food and a tip. */
export function DayCard({ day, currency, onChange }: DayCardProps) {
  const [open, setOpen] = useState(false);
  const [wish, setWish] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const cost = (value: number) => (value > 0 ? `≈ ${formatPrice(value, currency)}` : t('Free'));

  return (
    <article className={styles.day} aria-labelledby={`day-${String(day.day)}`}>
      <header className={styles.dayHeader}>
        <span className={styles.dayNumber}>{t('Day {0}', day.day)}</span>
        <span className={styles.dayDate}>{formatDay(day.date)}</span>
        <h3 id={`day-${String(day.day)}`} className={styles.dayTitle}>
          {day.title}
        </h3>
      </header>
      <div className={styles.dayBody}>
        {PARTS.map(([key, label]) => {
          const slot: Slot = day[key];
          return (
            <div key={key} className={styles.slot}>
              <span className={styles.slotLabel}>{t(label)}</span>
              <span className={styles.slotPlace}>{slot.place}</span>
              <span className={styles.slotCost}>{cost(slot.cost)}</span>
              <p className={styles.slotText}>{slot.activity}</p>
            </div>
          );
        })}
        {day.food.length > 0 && (
          <p className={styles.food}>
            <strong>{t('Eat:')}</strong> {day.food.join(' · ')}
          </p>
        )}
        {day.tip && (
          <p className={styles.tip}>
            <strong>{t('Tip:')}</strong> {day.tip}
          </p>
        )}
        <p className={styles.dayCost}>{t('Day total ≈ {0}', formatPrice(day.cost, currency))}</p>

        {onChange &&
          (open ? (
            <form
              className={styles.change}
              onSubmit={(event) => {
                event.preventDefault();
                setBusy(true);
                setError(undefined);
                onChange(wish.trim())
                  .then(() => {
                    setOpen(false);
                    setWish('');
                  })
                  .catch((cause: unknown) => {
                    setError(
                      cause instanceof Error ? cause.message : t('Could not change this day.'),
                    );
                  })
                  .finally(() => {
                    setBusy(false);
                  });
              }}
            >
              <label className={styles.changeLabel}>
                {t('What would you like instead? (optional)')}
                <input
                  className={styles.changeInput}
                  value={wish}
                  maxLength={200}
                  placeholder={t('e.g. more street food, fewer museums')}
                  disabled={busy}
                  onChange={(event) => {
                    setWish(event.target.value);
                  }}
                />
              </label>
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.changeActions}>
                <Button type="submit" size="sm" loading={busy}>
                  {t('Rewrite day')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    setError(undefined);
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className={styles.changeOpen}
              onClick={() => {
                setOpen(true);
              }}
            >
              {t('Change this day')}
            </Button>
          ))}
      </div>
    </article>
  );
}
