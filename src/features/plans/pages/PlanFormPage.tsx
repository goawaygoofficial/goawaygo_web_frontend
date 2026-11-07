import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  ButtonLink,
  ChoiceChips,
  CounterField,
  DateField,
  Icon,
  MultiChoiceChips,
  PageHeader,
  PageShell,
} from '@/components';
import { useBack } from '@/hooks';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import {
  BUDGET_OPTIONS,
  INTEREST_OPTIONS,
  MAX_DAYS,
  MAX_INTERESTS,
  PACE_OPTIONS,
  TRAVELLER_OPTIONS,
  readPlanPlace,
} from '../options';
import { createPlan } from '../services/plansService';
import type { BudgetLevel, Interest, Pace, Travellers } from '../types';
import styles from './PlanPages.module.css';

/**
 * "Plan a trip": when, how long, who, pace, budget and interests for the place it was opened from (a destination
 * page or My Trips). The AI writes the plan (10-40 s), then the plan opens. Signed in only.
 */
export function PlanFormPage() {
  const [params] = useSearchParams();
  const place = readPlanPlace(params);
  const navigate = useNavigate();
  const goBack = useBack(routes.trips);
  const { user, status } = useUser();
  const [startDate, setStartDate] = useState('');
  const [days, setDays] = useState(3);
  const [travellers, setTravellers] = useState<Travellers>('couple');
  const [pace, setPace] = useState<Pace>('balanced');
  const [budget, setBudget] = useState<BudgetLevel>('mid');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState<string>();
  const [planning, setPlanning] = useState(false);

  if (!place) return <Navigate to={routes.trips} replace />;
  const where = [place.area, place.country].filter(Boolean).join(', ');

  const submit = () => {
    if (!startDate) {
      setError('Choose when your trip starts.');
      return;
    }
    setError(undefined);
    setPlanning(true);
    createPlan({ place, startDate, days, travellers, pace, budget, interests })
      .then((plan) => {
        track({ name: 'trip_plan_created', props: { days } });
        void navigate(routes.plan(plan.id), { replace: true });
      })
      .catch((cause: unknown) => {
        setPlanning(false);
        setError(cause instanceof Error ? cause.message : 'Could not make your plan.');
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      <div className={styles.titleRow}>
        <Icon name="travel_explore" className={styles.titleIcon} />
        <h1 className={styles.title}>Plan a trip</h1>
      </div>
      <p className={styles.heading}>{place.name}</p>
      {where && <p className={styles.subheading}>{where}</p>}

      {status !== 'restoring' && !user ? (
        <section className={styles.panel}>
          <p>Sign in to plan a trip. Your plans are saved in My Trips.</p>
          <ButtonLink to={routes.profile}>Sign in</ButtonLink>
        </section>
      ) : planning ? (
        <section className={styles.panel} role="status">
          <Icon name="travel_explore" className={styles.panelIcon} />
          <p className={styles.panelTitle}>Planning your trip to {place.name}…</p>
          <p>Our AI is writing it day by day. This can take up to a minute.</p>
        </section>
      ) : (
        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className={styles.row}>
            <DateField
              label="Start date"
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                setError(undefined);
              }}
            />
            <CounterField
              label="Days"
              icon={<Icon name="calendar_month" />}
              value={days}
              onChange={(value) => {
                setDays(Math.min(MAX_DAYS, Math.max(1, value)));
              }}
            />
          </div>

          <p className={styles.label}>Who&apos;s going?</p>
          <ChoiceChips
            legend="Who's going"
            options={TRAVELLER_OPTIONS}
            value={travellers}
            onChange={setTravellers}
          />

          <p className={styles.label}>Pace</p>
          <ChoiceChips legend="Pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />

          <p className={styles.label}>Budget</p>
          <ChoiceChips
            legend="Budget"
            options={BUDGET_OPTIONS}
            value={budget}
            onChange={setBudget}
          />

          <p className={styles.label}>Interests (up to {MAX_INTERESTS})</p>
          <MultiChoiceChips
            legend="Interests"
            options={INTEREST_OPTIONS}
            value={interests}
            onChange={setInterests}
            max={MAX_INTERESTS}
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.actions}>
            <Button type="submit">Plan my trip</Button>
          </div>
          <p className={styles.note}>
            Plans are written by AI. Check opening times, prices and travel advice before you go.
          </p>
        </form>
      )}
    </PageShell>
  );
}
