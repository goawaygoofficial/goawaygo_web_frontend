import { Navigate, useSearchParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import { PartnerCardLink } from '../components/PartnerCardLink';
import { ResultsLayout } from '../components/ResultsLayout';
import { ResultsMessage } from '../components/ResultsMessage';
import { formatDateRange, plural } from '../format';
import { useResults } from '../hooks/useResults';
import { readStayQuery } from '../searchParams';
import { stayPartners } from '../services/bookService';

/**
 * Stay results: hotel partners opened on the place, dates and guests. No hotel prices here yet (no free source);
 * they arrive with a live partner, in the founder's hotel cards.
 */
export function StayResultsPage() {
  const [params] = useSearchParams();
  const search = readStayQuery(params);
  const { state, retry } = useResults(
    params.toString(),
    (signal) => (search ? stayPartners(search, signal) : Promise.reject(new Error(''))),
    'Could not open hotel partners.',
  );
  if (!search) return <Navigate to={routes.stays} replace />;

  const dates = formatDateRange(search.checkin, search.checkout);
  return (
    <ResultsLayout
      icon="hotel"
      title="Stays"
      heading={search.place}
      dates={dates}
      travellers={`${plural(search.adults, 'guest')} · ${plural(search.rooms, 'room')}`}
      note="Hotels and prices open on the partner's site, with your dates filled in"
      backTo={routes.stays}
    >
      {state.kind === 'loading' && <ResultsMessage title="Opening hotel partners…" />}
      {state.kind === 'error' && (
        <ResultsMessage title="Hotel partners didn't open" text={state.message} onRetry={retry} />
      )}
      {state.kind === 'ready' &&
        (state.data.length === 0 ? (
          <ResultsMessage title="No hotel partners here yet" text="Please try again later." />
        ) : (
          state.data.map((partner) => (
            <PartnerCardLink
              key={partner.id}
              partner={partner}
              kind={`Hotels in ${search.place}`}
              title={`See hotels for ${dates}`}
              detail={
                partner.id === 'tripcom'
                  ? `Pick ${search.place} from Trip.com's list to see hotels`
                  : 'Your dates and guests are filled in'
              }
              onOpen={() => {
                track({
                  name: 'partner_opened',
                  props: { category: 'stays', partner: partner.id },
                });
              }}
            />
          ))
        ))}
    </ResultsLayout>
  );
}
