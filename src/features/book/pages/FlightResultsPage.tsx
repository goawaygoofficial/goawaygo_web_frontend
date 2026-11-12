import { Navigate, useSearchParams } from 'react-router-dom';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import { FareCard } from '../components/FareCard';
import { ResultsLayout } from '../components/ResultsLayout';
import { ResultsMessage } from '../components/ResultsMessage';
import { formatDay, formatMonth, plural } from '../format';
import { useResults } from '../hooks/useResults';
import { readFlightQuery } from '../searchParams';
import { searchFlights } from '../services/bookService';
import styles from './ResultsPages.module.css';
import { t } from '@/lib/i18n';

/**
 * Flight results (the founder's design): recent fares on the date asked and on cheaper dates that month, each opening
 * on Aviasales, and a floating "See all flights" for Aviasales' live search. Recent prices, so labelled "may change".
 */
export function FlightResultsPage() {
  const [params] = useSearchParams();
  const search = readFlightQuery(params);
  const { state, retry } = useResults(
    params.toString(),
    (signal) => (search ? searchFlights(search, signal) : Promise.reject(new Error(''))),
    t('Could not find flight prices.'),
  );
  if (!search) return <Navigate to={routes.flights} replace />;

  const roundTrip = search.returnDate !== '';
  const opened = () => {
    track({ name: 'partner_opened', props: { category: 'flights', partner: 'aviasales' } });
  };

  return (
    <ResultsLayout
      icon="flight"
      title={t('Flights')}
      heading={t('{0} to {1}', search.fromName, search.toName)}
      dates={
        roundTrip
          ? `${formatDay(search.depart)} – ${formatDay(search.returnDate)}`
          : formatDay(search.depart)
      }
      travellers={plural(search.adults, 'passenger')}
      note={t('Recent prices travellers found · they may change until you book')}
      backTo={routes.flights}
      floating={
        state.kind === 'ready' && (
          <a
            className={styles.pill}
            href={state.data.searchLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={opened}
          >
            {t('See all flights')}
          </a>
        )
      }
    >
      {state.kind === 'loading' && <ResultsMessage title={t('Finding fares…')} />}
      {state.kind === 'error' && (
        <ResultsMessage title={t('No fares right now')} text={state.message} onRetry={retry} />
      )}
      {state.kind === 'ready' && (
        <>
          <h2 className={styles.section}>{t('On {0}', formatDay(search.depart))}</h2>
          {state.data.onDate.length === 0 ? (
            <ResultsMessage
              title={t('No recent price for this date')}
              text={t('Nobody searched this trip lately. See live prices for it on Aviasales.')}
            >
              <a
                className={styles.pill}
                href={state.data.searchLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={opened}
              >
                {t('See live prices')}
              </a>
            </ResultsMessage>
          ) : (
            state.data.onDate.map((fare) => (
              <FareCard
                key={fare.link}
                fare={fare}
                currency={state.data.currency}
                roundTrip={roundTrip}
                onOpen={opened}
              />
            ))
          )}
          {state.data.nearby.length > 0 && (
            <>
              <h2 className={styles.section}>
                {t('Other dates in {0}', formatMonth(search.depart))}
              </h2>
              {state.data.nearby.map((fare) => (
                <FareCard
                  key={fare.link}
                  fare={fare}
                  currency={state.data.currency}
                  roundTrip={roundTrip}
                  onOpen={opened}
                />
              ))}
            </>
          )}
        </>
      )}
    </ResultsLayout>
  );
}
