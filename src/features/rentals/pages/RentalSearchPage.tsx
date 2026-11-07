import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rentalsImage from '@/assets/images/rentals.png';
import { DateField, FieldPair, Icon, SearchFormLayout } from '@/components';
import { SuggestField, carQuery, suggestAirports } from '@/features/book';
import type { Airport } from '@/features/book';
import { track } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import type { RentalSearchRequest } from '../types';

const INITIAL_FORM: RentalSearchRequest = {
  pickupText: '',
  pickup: null,
  pickupDate: '',
  dropOffDate: '',
};

const MAX_DAYS = 30;

function describePickup(place: Airport) {
  return {
    key: `${place.type}-${place.code}`,
    title: place.type === 'airport' ? `${place.name} (${place.code})` : place.name,
    context:
      place.type === 'airport'
        ? `Airport · ${place.city ? `${place.city}, ` : ''}${place.country}`
        : `City · ${place.country}`,
    icon: <Icon name={place.type === 'airport' ? 'flight' : 'location_on_outlined'} />,
  };
}

/** What stops the search, or null when it can run. */
function problem(form: RentalSearchRequest): string | null {
  if (form.pickupText.trim().length < 2) return 'Type where you pick up the car.';
  if (!form.pickupDate || !form.dropOffDate) return 'Choose your pick-up and drop-off dates.';
  const days = Math.round(
    (Date.parse(form.dropOffDate) - Date.parse(form.pickupDate)) / 86_400_000,
  );
  if (days < 1) return 'Drop-off must be after pick-up.';
  if (days > MAX_DAYS) return `Choose a rental of up to ${String(MAX_DAYS)} days.`;
  return null;
}

/**
 * Rent a car: where and when. Partners compare every rental company there (car type, drop-off elsewhere and driver
 * age are chosen on the partner's site).
 */
export function RentalSearchPage() {
  useEffect(() => {
    track({ name: 'travel_category_opened', props: { category: 'rentals' } });
  }, []);
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState<string>();
  const update = (patch: Partial<RentalSearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
    setError(undefined);
  };

  return (
    <SearchFormLayout
      title="Rent a Car"
      imageSrc={rentalsImage}
      error={error}
      onSubmit={() => {
        const stop = problem(form);
        if (stop) {
          setError(stop);
          return;
        }
        track({ name: 'book_searched', props: { category: 'rentals' } });
        const query = carQuery({
          place:
            form.pickup?.type === 'airport'
              ? form.pickup.city || form.pickup.name
              : form.pickupText.trim(),
          airport: form.pickup?.type === 'airport' ? form.pickup.code : '',
          pickup: form.pickupDate,
          dropoff: form.dropOffDate,
        });
        void navigate(`${routes.rentalResults}?${query}`);
      }}
    >
      <SuggestField
        label="Pick-up"
        placeholder="Pick-up (city or airport)"
        icon={<Icon name="my_location_sharp" />}
        text={form.pickupText}
        onTextChange={(pickupText) => {
          update({ pickupText, pickup: null });
        }}
        suggest={suggestAirports}
        describe={describePickup}
        onPick={(pickup) => {
          update({
            pickup,
            pickupText: pickup.type === 'airport' ? `${pickup.name} (${pickup.code})` : pickup.name,
          });
        }}
      />

      <FieldPair
        orientation="horizontal"
        swapLabel="Swap pick-up and drop-off dates"
        onSwap={() => {
          update({ pickupDate: form.dropOffDate, dropOffDate: form.pickupDate });
        }}
        first={
          <DateField
            label="Pick-up date"
            value={form.pickupDate}
            onChange={(pickupDate) => {
              update({ pickupDate });
            }}
          />
        }
        second={
          <DateField
            label="Drop-off date"
            value={form.dropOffDate}
            onChange={(dropOffDate) => {
              update({ dropOffDate });
            }}
          />
        }
      />
    </SearchFormLayout>
  );
}
