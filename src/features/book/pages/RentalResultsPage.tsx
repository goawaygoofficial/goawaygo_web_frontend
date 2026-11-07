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
    'Could not open car rental partners.',
  );
  if (!search) return <Navigate to={routes.rentals} replace />;

  const dates = formatDateRange(search.pickup, search.dropoff);
  return (
    <ResultsLayout
      icon="directions_car"
      title="Car Rentals"
      heading={search.place}
      dates={dates}
      note="Cars and prices open on the partner's site; compare them there"
      backTo={routes.rentals}
    >
      {state.kind === 'loading' && <ResultsMessage title="Opening rental partners…" />}
      {state.kind === 'error' && (
        <ResultsMessage title="Rental partners didn't open" text={state.message} onRetry={retry} />
      )}
      {state.kind === 'ready' &&
        (state.data.length === 0 ? (
          <ResultsMessage title="No rental partners here yet" text="Please try again later." />
        ) : (
          state.data.map((partner) => (
            <PartnerCardLink
              key={partner.id}
              partner={partner}
              kind="Car rental comparison"
              title={`Cars in ${search.place}`}
              detail={
                partner.id === 'economybookings' && search.airport
                  ? `Opens on ${search.airport} airport; add your dates (${dates})`
                  : `Enter ${search.place} and ${dates} there`
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
