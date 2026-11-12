import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import { formatDateRange, formatPrice, plural } from '@/features/book';
import { useBack } from '@/hooks';
import { ApiError } from '@/lib/apiClient';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { DayCard } from '../components/DayCard';
import { BUDGET_OPTIONS, PACE_OPTIONS, TRAVELLER_OPTIONS, bookingShortcuts } from '../options';
import { rememberPlan } from '../recentPlans';
import { changeDay, deletePlan, getPlan, getSharedPlan, sharePlan } from '../services/plansService';
import type { Plan } from '../types';
import cards from '../components/PlanCards.module.css';
import styles from './PlanPages.module.css';
import { t } from '@/lib/i18n';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; plan: Plan }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

function label<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T,
): string {
  return t(options.find((o) => o.value === value)?.label ?? value);
}

/**
 * A trip plan: the days with their places, food and tips, the cost estimate and booking shortcuts. Its owner can
 * change a day, share it by link and delete it; `shared` opens someone's shared plan read-only.
 */
export function PlanPage({ shared = false }: { shared?: boolean }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const goBack = useBack(shared ? routes.home : routes.trips);
  const { user, status } = useUser();
  const signedIn = user !== null;
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${id}|${String(shared)}|${String(attempt)}`;
  const [result, setResult] = useState<{ requestKey: string; state: State } | null>(null);

  useEffect(() => {
    if (status === 'restoring') return;
    const controller = new AbortController();
    (shared ? getSharedPlan : getPlan)(id, controller.signal)
      .then((plan) => {
        // Signed in, the backend keeps Recently viewed; signed out, this browser does.
        if (shared && !signedIn) rememberPlan(plan);
        setResult({ requestKey, state: { kind: 'ready', plan } });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          requestKey,
          state:
            cause instanceof ApiError && cause.status === 404
              ? { kind: 'notFound' }
              : {
                  kind: 'error',
                  message: cause instanceof Error ? cause.message : t('Could not open this plan.'),
                },
        });
      });
    return () => {
      controller.abort();
    };
  }, [id, shared, status, signedIn, requestKey]);

  const setPlan = useCallback(
    (plan: Plan) => {
      setResult({ requestKey, state: { kind: 'ready', plan } });
    },
    [requestKey],
  );

  const state: State = result?.requestKey === requestKey ? result.state : { kind: 'loading' };

  return (
    <PageShell>
      <PageHeader onBack={goBack} />
      {state.kind === 'loading' && (
        <p className={styles.status} role="status">
          {t('Opening the plan…')}
        </p>
      )}
      {state.kind === 'notFound' && (
        <section className={styles.panel}>
          <p className={styles.panelTitle}>{t("This plan isn't available")}</p>
          <p>{t("It may have been deleted, or it isn't shared any more.")}</p>
          <ButtonLink to={routes.home}>{t('Home')}</ButtonLink>
        </section>
      )}
      {state.kind === 'error' && (
        <section className={styles.panel} role="alert">
          <p className={styles.panelTitle}>{t('Something went wrong')}</p>
          <p>{state.message}</p>
          <Button
            onClick={() => {
              setAttempt((value) => value + 1);
            }}
          >
            {t('Try again')}
          </Button>
        </section>
      )}
      {state.kind === 'ready' && (
        <PlanView
          plan={state.plan}
          onChanged={setPlan}
          onDeleted={() => {
            void navigate(routes.trips, { replace: true });
          }}
        />
      )}
    </PageShell>
  );
}

function PlanView({
  plan,
  onChanged,
  onDeleted,
}: {
  plan: Plan;
  onChanged: (plan: Plan) => void;
  onDeleted: () => void;
}) {
  const where = [plan.place.area, plan.place.country].filter(Boolean).join(', ');
  const links = bookingShortcuts(plan);
  const money = (value: number) => formatPrice(value, plan.currency);

  return (
    <>
      <h1 className={styles.planTitle}>{plan.title}</h1>
      <p className={styles.subheading}>
        {plan.place.name}
        {where ? `, ${where}` : ''}
      </p>
      <div className={styles.infoRow}>
        <span className={styles.info}>
          <Icon name="calendar_today" />
          {formatDateRange(plan.startDate, plan.endDate)} · {plural(plan.days, 'day')}
        </span>
        <span className={styles.info}>
          <Icon name="person" />
          {label(TRAVELLER_OPTIONS, plan.travellers)} · {label(PACE_OPTIONS, plan.pace)} ·{' '}
          {label(BUDGET_OPTIONS, plan.budget)}
        </span>
      </div>
      {plan.summary && <p className={styles.summary}>{plan.summary}</p>}

      <div className={cards.estimate}>
        <span className={cards.estimateSide}>
          <span className={cards.big}>{t('≈ {0} a day', money(plan.estimate.perDay))}</span>
          <span className={cards.small}>{t('Food, local transport and activities')}</span>
        </span>
        <span className={cards.estimateMain}>
          {plan.estimate.nights > 0 && (
            <span className={cards.line}>
              {t('Stays ≈ {0} a night', money(plan.estimate.stayPerNight))}
            </span>
          )}
          <span className={cards.line}>
            <strong>≈ {money(plan.estimate.total)}</strong> {t('for the trip')}
          </span>
          <span className={cards.small}>
            {t('AI estimate for the group · flights not included')}
          </span>
        </span>
      </div>

      <nav className={styles.shortcuts} aria-label={t('Book this trip')}>
        <Link className={styles.shortcut} to={links.flights}>
          <Icon name="flight" /> {t('Flights')}
        </Link>
        <Link className={styles.shortcut} to={links.stays}>
          <Icon name="hotel" /> {t('Stays')}
        </Link>
        <Link className={styles.shortcut} to={links.cars}>
          <Icon name="directions_car" /> {t('Car rentals')}
        </Link>
      </nav>

      <div className={styles.days}>
        {plan.dayPlans.map((day) => (
          <DayCard
            key={`${String(day.day)}-${day.title}`}
            day={day}
            currency={plan.currency}
            onChange={
              plan.mine
                ? async (wish) => {
                    onChanged(await changeDay(plan.id, day.day, wish));
                  }
                : undefined
            }
          />
        ))}
      </div>

      {plan.tips.length > 0 && (
        <section className={styles.tips} aria-labelledby="tips-heading">
          <h2 id="tips-heading" className={styles.section}>
            {t('Tips for the trip')}
          </h2>
          <ul>
            {plan.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      )}

      {plan.mine ? (
        <OwnerActions plan={plan} onChanged={onChanged} onDeleted={onDeleted} />
      ) : (
        <section className={styles.panel}>
          <p>{t("Made with GoAwayGo's AI trip planner.")}</p>
          <ButtonLink to={routes.home}>{t('Plan your own trip')}</ButtonLink>
        </section>
      )}
      <p className={styles.note}>
        {t('Plans are written by AI. Check opening times, prices and travel advice before you go.')}
      </p>
    </>
  );
}

function OwnerActions({
  plan,
  onChanged,
  onDeleted,
}: {
  plan: Plan;
  onChanged: (plan: Plan) => void;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${routes.sharedPlan(plan.id)}`;

  const run = (action: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    action()
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : t('Something went wrong.'));
      })
      .finally(() => {
        setBusy(false);
      });
  };

  return (
    <section className={styles.panel} aria-label={t('Share or delete this plan')}>
      {plan.shared ? (
        <>
          <p>{t('Anyone with this link can view the plan:')}</p>
          <p className={styles.link}>{link}</p>
          <div className={styles.buttons}>
            <Button
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                });
              }}
            >
              {copied ? t('Link copied') : t('Copy link')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={busy}
              onClick={() => {
                run(async () => {
                  onChanged(await sharePlan(plan.id, false));
                });
              }}
            >
              {t('Stop sharing')}
            </Button>
          </div>
        </>
      ) : (
        <Button
          loading={busy}
          onClick={() => {
            run(async () => {
              onChanged(await sharePlan(plan.id, true));
              track({ name: 'trip_plan_shared' });
            });
          }}
        >
          {t('Share by link')}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            return;
          }
          run(async () => {
            await deletePlan(plan.id);
            onDeleted();
          });
        }}
      >
        {confirmDelete ? t('Tap again to delete this plan') : t('Delete plan')}
      </Button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
