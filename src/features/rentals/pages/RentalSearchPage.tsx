import { useState } from 'react';
import { CarFront, LocateFixed, MapPin } from 'lucide-react';
import rentalsImage from '@/assets/images/rentals.png';
import {
  ChoiceChips,
  DateField,
  FieldPair,
  SearchFormLayout,
  SelectField,
  TextField,
} from '@/components';
import { TRIP_TYPE_OPTIONS } from '@/types/search';
import type { TripType } from '@/types/search';
import { searchRentals } from '../services/rentalService';
import { CAR_TYPES } from '../types';
import type { RentalSearchRequest } from '../types';

const INITIAL_FORM: RentalSearchRequest = {
  pickup: '',
  dropOff: '',
  tripType: 'roundTrip',
  departureDate: '',
  returnDate: '',
  carType: '',
};

export function RentalSearchPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const update = (patch: Partial<RentalSearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
  };
  const isRoundTrip = form.tripType === 'roundTrip';

  return (
    <SearchFormLayout
      title="Rent a Car"
      imageSrc={rentalsImage}
      onSubmit={() => {
        searchRentals(form);
      }}
    >
      <FieldPair
        orientation="vertical"
        swapLabel="Swap pickup and drop-off"
        onSwap={() => {
          setForm((current) => ({ ...current, pickup: current.dropOff, dropOff: current.pickup }));
        }}
        first={
          <TextField
            label="Pickup"
            placeholder="Pickup"
            tone="tinted"
            icon={<LocateFixed />}
            value={form.pickup}
            onChange={(event) => {
              update({ pickup: event.target.value });
            }}
          />
        }
        second={
          <TextField
            label="Drop-off"
            placeholder="Drop-off"
            tone="tinted"
            icon={<MapPin />}
            value={form.dropOff}
            onChange={(event) => {
              update({ dropOff: event.target.value });
            }}
          />
        }
      />

      <ChoiceChips
        legend="Trip type"
        options={TRIP_TYPE_OPTIONS}
        value={form.tripType}
        onChange={(tripType: TripType) => {
          update(tripType === 'oneWay' ? { tripType, returnDate: '' } : { tripType });
        }}
      />

      <FieldPair
        orientation="horizontal"
        swapLabel="Swap departure and return dates"
        onSwap={() => {
          setForm((current) => ({
            ...current,
            departureDate: current.returnDate,
            returnDate: current.departureDate,
          }));
        }}
        first={
          <DateField
            label="Departure"
            value={form.departureDate}
            onChange={(departureDate) => {
              update({ departureDate });
            }}
          />
        }
        second={
          isRoundTrip ? (
            <DateField
              label="Return"
              value={form.returnDate}
              onChange={(returnDate) => {
                update({ returnDate });
              }}
            />
          ) : undefined
        }
      />

      <SelectField
        label="Car type"
        placeholder="Select a car type"
        icon={<CarFront />}
        options={CAR_TYPES}
        value={form.carType}
        onChange={(carType) => {
          update({ carType });
        }}
      />
    </SearchFormLayout>
  );
}
