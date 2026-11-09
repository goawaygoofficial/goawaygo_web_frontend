import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import myTripsIcon from '@/assets/icons/mytrips_white.png';
import { ButtonLink, Icon, PageHeader, PageShell } from '@/components';
import { formatDateRange, plural } from '@/features/book';
import { useSavedPlaces } from '@/features/discover';
import type { SavedPlace } from '@/features/discover';
import { listPlans, planPlaceQuery } from '@/features/plans';
import type { PlanSummary } from '@/features/plans';
import { addDays, toIsoDate } from '@/lib/date';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import styles from './MyTripsPage.module.css';
import { t } from '@/lib/i18n';

const TONES = [styles.sunset, styles.ember, styles.coral, styles.peach];

/** The signed-in user's trip plans (null while loading); a failed load shows no plans section. */
function useTripPlans(signedIn: boolean): PlanSummary[] | null {
  const [plans, setPlans] = useState<{ for: boolean; list: PlanSummary[] } | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    listPlans(controller.signal)
      .then((list) => {
        setPlans({ for: signedIn, list });
      })
      .catch(() => {
        if (!controller.signal.aborted) setPlans({ for: signedIn, list: [] });
      });
    return () => {
      controller.abort();
    };
  }, [signedIn]);
  return plans?.for === signedIn ? plans.list : null;
}

/** My Trips: trip plans made with the AI planner, and places saved from Ideas (sign-in needed). */
export function MyTripsPage() {
  const { user, status } = useUser();
  const saved = useSavedPlaces();
  const plans = useTripPlans(user !== null);

  if (status === 'restoring') return <PageShell>{null}</PageShell>;

  if (!user) {
    return (
      <EmptyState
        title={t('Save places you love')}
        text={t('Sign in to keep places from Ideas and trip plans in My Trips.')}
        link={{ to: routes.profile, label: t('Sign in') }}
      />
    );
  }
  if (saved.error) {
    return (
      <EmptyState
        title={t('My Trips')}
        text={saved.error}
        link={{ to: routes.home, label: t('Home') }}
      />
    );
  }
  if (saved.places === null || plans === null) return <PageShell>{null}</PageShell>;
  if (saved.places.length === 0 && plans.length === 0) {
    return (
      <EmptyState
        title={t('No trips yet')}
        text={t(
          "Save places from Ideas on Home, or open a destination and plan a trip. They'll show up here.",
        )}
        link={{ to: routes.home, label: t('Find ideas') }}
      />
    );
  }

  return (
    <PageShell width="wide">
      <PageHeader />
      <h1 className={styles.heading}>{t('My Trips')}</h1>
      {plans.length > 0 && (
        <section aria-labelledby="plans-heading" className={styles.section}>
          <h2 id="plans-heading" className={styles.subheading}>
            {t('Trip plans')}
          </h2>
          <ul className={styles.plans}>
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link to={routes.plan(plan.id)} className={styles.planCard}>
                  <span className={styles.planSide}>
                    <span className={styles.planPlace}>{plan.placeName}</span>
                    <span className={styles.planMeta}>{plan.country}</span>
                  </span>
                  <span className={styles.planMain}>
                    <span className={styles.planTitle}>{plan.title}</span>
                    <span className={styles.planMeta}>
                      {formatDateRange(plan.startDate, addDaysIso(plan.startDate, plan.days - 1))} ·{' '}
                      {plural(plan.days, 'day')}
                      {plan.shared ? t(' · Shared') : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {saved.places.length > 0 && <h2 className={styles.subheading}>{t('Saved places')}</h2>}
      <ul className={styles.grid}>
        {saved.places.map((place, index) => (
          <SavedPlaceCard
            key={place.id}
            place={place}
            tone={TONES[index % TONES.length]}
            onRemove={saved.remove}
          />
        ))}
      </ul>
    </PageShell>
  );
}

/** `YYYY-MM-DD` plus some days. */
function addDaysIso(date: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = date.split('-').map(Number);
  return toIsoDate(addDays(new Date(year, month - 1, day), days));
}

function SavedPlaceCard({
  place,
  tone,
  onRemove,
}: {
  place: SavedPlace;
  tone: string | undefined;
  onRemove: (id: number) => Promise<void>;
}) {
  const [removing, setRemoving] = useState(false);
  const where = [place.area, place.country].filter(Boolean).join(', ');

  return (
    <li className={[styles.card, tone].filter(Boolean).join(' ')}>
      <span className={styles.where}>{where}</span>
      <span className={styles.name}>{place.name}</span>
      {place.category && <span className={styles.tag}>{place.category}</span>}
      <Link
        className={styles.planLink}
        to={`${routes.planNew}?${planPlaceQuery({
          placeId: null,
          name: place.name,
          area: place.area ?? '',
          country: place.country,
          lat: place.lat,
          lon: place.lon,
        })}`}
      >
        <Icon name="travel_explore" /> {t('Plan a trip')}
      </Link>
      <Link
        to={routes.destination(place.name, { q: `${place.name}, ${place.country}` })}
        className={styles.open}
        aria-label={t('Open {0}, {1}', place.name, place.country)}
      />
      <button
        type="button"
        className={styles.remove}
        aria-label={t('Remove {0} from My Trips', place.name)}
        disabled={removing}
        onClick={() => {
          setRemoving(true);
          onRemove(place.id).catch(() => {
            setRemoving(false);
          });
        }}
      >
        <Icon name="delete_outline" />
      </button>
    </li>
  );
}

function EmptyState({
  title,
  text,
  link,
}: {
  title: string;
  text: string;
  link: { to: string; label: string };
}) {
  return (
    <PageShell>
      <PageHeader />
      <section className={styles.empty} aria-labelledby="trips-heading">
        <span className={styles.badge}>
          <img src={myTripsIcon} alt="" className={styles.icon} />
        </span>
        <h1 id="trips-heading" className={styles.title}>
          {title}
        </h1>
        <p className={styles.text}>{text}</p>
        <ButtonLink to={link.to}>{link.label}</ButtonLink>
      </section>
    </PageShell>
  );
}
