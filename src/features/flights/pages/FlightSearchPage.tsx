import { usePageMeta } from '@/lib/pageMeta';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import flightsImage from '@/assets/images/flights.png';
import {
  ChoiceChips,
  CounterField,
  DateField,
  FieldPair,
  FormRow,
  Icon,
  SearchFormLayout,
} from '@/components';
import { SuggestField, flightQuery, suggestAirports } from '@/features/book';
import type { Airport } from '@/features/book';
import { TRIP_TYPE_OPTIONS } from '@/types/search';
import type { TripType } from '@/types/search';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import type { FlightSearchRequest } from '../types';
import { t } from '@/lib/i18n';

const INITIAL_FORM: FlightSearchRequest = {
  fromText: '',
  from: null,
  toText: '',
  to: null,
  tripType: 'roundTrip',
  departureDate: '',
  returnDate: '',
  passengers: 1,
};

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The form opened from a trip plan's Flights shortcut: destination and dates filled in. */
function fromShortcut(params: URLSearchParams): FlightSearchRequest {
  const to = params.get('to') ?? '';
  const toName = params.get('toName') ?? '';
  const depart = params.get('depart') ?? '';
  const back = params.get('return') ?? '';
  const airport: Airport | null =
    IATA.test(to) && toName
      ? { code: to, type: 'city', name: toName, city: '', country: '', countryCode: '' }
      : null;
  return {
    ...INITIAL_FORM,
    to: airport,
    toText: airport ? `${airport.name} (${airport.code})` : '',
    departureDate: DATE.test(depart) ? depart : '',
    returnDate: DATE.test(back) ? back : '',
  };
}

function airportLabel(airport: Airport): string {
  return airport.type === 'airport'
    ? `${airport.name} (${airport.code})`
    : `${airport.name} (${airport.code}), ${airport.country}`;
}

function describeAirport(airport: Airport) {
  return {
    key: `${airport.type}-${airport.code}`,
    title: `${airport.name} (${airport.code})`,
    context:
      airport.type === 'airport'
        ? `${airport.city ? `${airport.city}, ` : ''}${airport.country}`
        : t('All airports · {0}', airport.country),
    icon: <Icon name={airport.type === 'airport' ? 'flight' : 'location_on_outlined'} />,
  };
}

/** What stops the search, or null when it can run. */
function problem(form: FlightSearchRequest): string | null {
  if (!form.from) return t('Pick where you fly from from the suggestions.');
  if (!form.to) return t('Pick where you fly to from the suggestions.');
  if (form.from.code === form.to.code) return t('Pick a different destination.');
  if (!form.departureDate) return t('Choose a departure date.');
  if (form.tripType === 'roundTrip' && !form.returnDate) return t('Choose a return date.');
  if (form.tripType === 'roundTrip' && form.returnDate < form.departureDate) {
    return t('The return date must be on or after the departure date.');
  }
  return null;
}

export function FlightSearchPage() {
  usePageMeta(
    t('Book Your Flights'),
    t('Compare flight prices for your dates and book with trusted partners.'),
  );
  useEffect(() => {
    track({ name: 'travel_category_opened', props: { category: 'flights' } });
  }, []);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => fromShortcut(params));
  const [error, setError] = useState<string>();
  const update = (patch: Partial<FlightSearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError(undefined);
  };
  const isRoundTrip = form.tripType === 'roundTrip';

  return (
    <SearchFormLayout
      title={t('Book Your Flights')}
      imageSrc={flightsImage}
      error={error}
      onSubmit={() => {
        const stop = problem(form);
        if (stop || !form.from || !form.to) {
          setError(stop ?? undefined);
          return;
        }
        track({ name: 'book_searched', props: { category: 'flights' } });
        const query = flightQuery({
          from: form.from.code,
          fromName: form.from.name,
          to: form.to.code,
          toName: form.to.name,
          depart: form.departureDate,
          returnDate: isRoundTrip ? form.returnDate : '',
          adults: form.passengers,
        });
        void navigate(`${routes.flightResults}?${query}`);
      }}
    >
      <FieldPair
        orientation="vertical"
        swapLabel={t('Swap origin and destination')}
        onSwap={() => {
          update({ fromText: form.toText, from: form.to, toText: form.fromText, to: form.from });
        }}
        first={
          <SuggestField
            label={t('From')}
            placeholder={t('From (city or airport)')}
            icon={<Icon name="location_on_outlined" />}
            text={form.fromText}
            onTextChange={(fromText) => {
              update({ fromText, from: null });
            }}
            suggest={suggestAirports}
            describe={describeAirport}
            onPick={(from) => {
              update({ from, fromText: airportLabel(from) });
            }}
          />
        }
        second={
          <SuggestField
            label={t('To')}
            placeholder={t('To (city or airport)')}
            icon={<Icon name="public" />}
            text={form.toText}
            onTextChange={(toText) => {
              update({ toText, to: null });
            }}
            suggest={suggestAirports}
            describe={describeAirport}
            onPick={(to) => {
              update({ to, toText: airportLabel(to) });
            }}
          />
        }
      />

      <ChoiceChips
        legend={t('Trip type')}
        options={TRIP_TYPE_OPTIONS}
        value={form.tripType}
        onChange={(tripType: TripType) => {
          update(tripType === 'oneWay' ? { tripType, returnDate: '' } : { tripType });
        }}
      />

      <FieldPair
        orientation="horizontal"
        swapLabel={t('Swap departure and return dates')}
        onSwap={() => {
          update({ departureDate: form.returnDate, returnDate: form.departureDate });
        }}
        first={
          <DateField
            label={t('Departure')}
            value={form.departureDate}
            onChange={(departureDate) => {
              update({ departureDate });
            }}
          />
        }
        second={
          isRoundTrip ? (
            <DateField
              label={t('Return')}
              value={form.returnDate}
              onChange={(returnDate) => {
                update({ returnDate });
              }}
            />
          ) : undefined
        }
      />

      <FormRow>
        <CounterField
          label={t('Passengers')}
          icon={<Icon name="person" />}
          value={form.passengers}
          onChange={(passengers) => {
            update({ passengers: Math.min(9, Math.max(1, passengers)) });
          }}
        />
      </FormRow>
    </SearchFormLayout>
  );
}
