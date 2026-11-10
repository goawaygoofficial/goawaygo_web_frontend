import { Navigate, useSearchParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import { PartnerCardLink } from '../components/PartnerCardLink';
import { ResultsLayout } from '../components/ResultsLayout';
import { ResultsMessage } from '../components/ResultsMessage';
import { formatDateRange } from '../format';
import { useResults } from '../hooks/useResults';
import { readCarQuery } from '../searchParams';
import { carPartners } from '../services/bookService';
import { t } from '@/lib/i18n';

/**
 * Car rental results: rental comparison partners for the pick-up place. No car prices here yet (no free source);
 * they arrive with a live partner, in the founder's car cards.
 */
export function RentalResultsPage() {
  const [params] = useSearchParams();
  const search = readCarQuery(params);
  const { state, retry } = useResults(
    params.toString(),
    (signal) => (search ? carPartners(search, signal) : Promise.reject(new Error(''))),
    t('Could not open car rental partners.'),
  );
  if (!search) return <Navigate to={routes.rentals} replace />;

  const dates = formatDateRange(search.pickup, search.dropoff);
  return (
    <ResultsLayout
      icon="directions_car"
      title={t('Car Rentals')}
      heading={search.place}
      dates={dates}
      note={t("Cars and prices open on the partner's site; compare them there")}
      backTo={routes.rentals}
    >
      {state.kind === 'loading' && <ResultsMessage title={t('Opening rental partners…')} />}
      {state.kind === 'error' && (
        <ResultsMessage
          title={t("Rental partners didn't open")}
          text={state.message}
          onRetry={retry}
        />
      )}
      {state.kind === 'ready' &&
        (state.data.length === 0 ? (
          <ResultsMessage
            title={t('No rental partners here yet')}
            text={t('Please try again later.')}
          />
        ) : (
          state.data.map((partner) => (
            <PartnerCardLink
              key={partner.id}
              partner={partner}
              kind="Car rental comparison"
              title={t('Cars in {0}', search.place)}
              detail={
                partner.id === 'economybookings' && search.airport
                  ? t('Opens on {0} airport; add your dates ({1})', search.airport, dates)
                  : t('Enter {0} and {1} there', search.place, dates)
              }
              onOpen={() => {
                track({
                  name: 'partner_opened',
                  props: { category: 'rentals', partner: partner.id },
                });
              }}
            />
          ))
        ))}
    </ResultsLayout>
  );
}
