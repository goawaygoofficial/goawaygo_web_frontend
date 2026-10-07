import { useState } from 'react';
import { Baby, Globe, MapPin, User } from 'lucide-react';
import flightsImage from '@/assets/images/flights.png';
import {
  ChoiceChips,
  CounterField,
  DateField,
  FieldPair,
  FormRow,
  SearchFormLayout,
  TextField,
} from '@/components';
import { TRIP_TYPE_OPTIONS } from '@/types/search';
import type { TripType } from '@/types/search';
import { searchFlights } from '../services/flightService';
import type { FlightSearchRequest } from '../types';

const INITIAL_FORM: FlightSearchRequest = {
  from: '',
  to: '',
  tripType: 'roundTrip',
  departureDate: '',
  returnDate: '',
  adults: 1,
  children: 0,
};

export function FlightSearchPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const update = (patch: Partial<FlightSearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
  };
  const isRoundTrip = form.tripType === 'roundTrip';

  return (
    <SearchFormLayout
      title="Book Your Flights"
      imageSrc={flightsImage}
      onSubmit={() => {
        searchFlights(form);
      }}
    >
      <FieldPair
        orientation="vertical"
        swapLabel="Swap origin and destination"
        onSwap={() => {
          setForm((current) => ({ ...current, from: current.to, to: current.from }));
        }}
        first={
          <TextField
            label="From"
            placeholder="From"
            tone="tinted"
            icon={<MapPin />}
            value={form.from}
            onChange={(event) => {
              update({ from: event.target.value });
            }}
          />
        }
        second={
          <TextField
            label="To"
            placeholder="To"
            tone="tinted"
            icon={<Globe />}
            value={form.to}
            onChange={(event) => {
              update({ to: event.target.value });
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

      <FormRow>
        <CounterField
          label="Adults"
          icon={<User />}
          value={form.adults}
          onChange={(adults) => {
            update({ adults });
          }}
        />
        <CounterField
          label="Children"
          icon={<Baby />}
          value={form.children}
          onChange={(children) => {
            update({ children });
          }}
        />
      </FormRow>
    </SearchFormLayout>
  );
}
