import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import staysImage from '@/assets/images/stays.png';
import { CounterField, DateField, FieldPair, FormRow, Icon, SearchFormLayout } from '@/components';
import { SuggestField, stayQuery } from '@/features/book';
import { placeContext, suggestPlaces } from '@/features/discover';
import type { Place } from '@/features/discover';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import type { StaySearchRequest } from '../types';
import { t } from '@/lib/i18n';

const INITIAL_FORM: StaySearchRequest = {
  destination: '',
  checkIn: '',
  checkOut: '',
  rooms: 1,
  adults: 2,
};

const MAX_NIGHTS = 30;

function describePlace(place: Place) {
  return {
    key: place.id,
    title: place.name,
    context: placeContext(place),
    icon: <Icon name={place.type === 'country' ? 'public' : 'location_on_outlined'} />,
  };
}

function nights(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
}

/** What stops the search, or null when it can run. */
function problem(form: StaySearchRequest): string | null {
  if (form.destination.trim().length < 2) return t('Type where you want to stay.');
  if (!form.checkIn || !form.checkOut) return t('Choose your check-in and check-out dates.');
  const stay = nights(form.checkIn, form.checkOut);
  if (stay < 1) return t('Check-out must be after check-in.');
  if (stay > MAX_NIGHTS) return t('Choose a stay of up to {0} nights.', String(MAX_NIGHTS));
  if (form.rooms > form.adults) return t('Choose at least one guest per room.');
  return null;
}

export function StaySearchPage() {
  useEffect(() => {
    track({ name: 'travel_category_opened', props: { category: 'stays' } });
  }, []);
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string>();
  const update = (patch: Partial<StaySearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError(undefined);
  };

  return (
    <SearchFormLayout
      title={t('Book Your Hotels')}
      imageSrc={staysImage}
      error={error}
      onSubmit={() => {
        const stop = problem(form);
        if (stop) {
          setError(stop);
          return;
        }
        track({ name: 'book_searched', props: { category: 'stays' } });
        const query = stayQuery({
          place: form.destination.trim(),
          checkin: form.checkIn,
          checkout: form.checkOut,
          adults: form.adults,
          rooms: form.rooms,
        });
        void navigate(`${routes.stayResults}?${query}`);
      }}
    >
      <SuggestField
        label={t('Where?')}
        placeholder={t('Where? (city or area)')}
        icon={<Icon name="public" />}
        text={form.destination}
        onTextChange={(destination) => {
          update({ destination });
        }}
        suggest={suggestPlaces}
        describe={describePlace}
        onPick={(place) => {
          update({ destination: place.name });
        }}
      />

      <FieldPair
        orientation="horizontal"
        swapLabel={t('Swap check-in and check-out dates')}
        onSwap={() => {
          update({ checkIn: form.checkOut, checkOut: form.checkIn });
        }}
        first={
          <DateField
            label={t('Check-in')}
            value={form.checkIn}
            onChange={(checkIn) => {
              update({ checkIn });
            }}
          />
        }
        second={
          <DateField
            label={t('Check-out')}
            value={form.checkOut}
            onChange={(checkOut) => {
              update({ checkOut });
            }}
          />
        }
      />

      <FormRow>
        <CounterField
          label={t('Rooms')}
          icon={<Icon name="hotel_rounded" />}
          value={form.rooms}
          onChange={(rooms) => {
            update({ rooms: Math.min(8, Math.max(1, rooms)) });
          }}
        />
        <CounterField
          label={t('Guests')}
          icon={<Icon name="person" />}
          value={form.adults}
          onChange={(adults) => {
            update({ adults: Math.min(30, Math.max(1, adults)) });
          }}
        />
      </FormRow>
    </SearchFormLayout>
  );
}
