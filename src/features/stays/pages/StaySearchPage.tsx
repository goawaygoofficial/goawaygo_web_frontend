import { useState } from 'react';
import { BedDouble, Globe, User } from 'lucide-react';
import staysImage from '@/assets/images/stays.png';
import {
  CounterField,
  DateField,
  FieldPair,
  FormRow,
  SearchFormLayout,
  TextField,
} from '@/components';
import { searchStays } from '../services/stayService';
import type { StaySearchRequest } from '../types';

const INITIAL_FORM: StaySearchRequest = {
  destination: '',
  checkIn: '',
  checkOut: '',
  rooms: 1,
  adults: 1,
};

export function StaySearchPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const update = (patch: Partial<StaySearchRequest>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  return (
    <SearchFormLayout
      title="Book Your Hotels"
      imageSrc={staysImage}
      onSubmit={() => {
        searchStays(form);
      }}
    >
      <TextField
        label="Where?"
        placeholder="Where?"
        tone="tinted"
        icon={<Globe />}
        value={form.destination}
        onChange={(event) => {
          update({ destination: event.target.value });
        }}
      />

      <FieldPair
        orientation="horizontal"
        swapLabel="Swap check-in and check-out dates"
        onSwap={() => {
          setForm((current) => ({
            ...current,
            checkIn: current.checkOut,
            checkOut: current.checkIn,
          }));
        }}
        first={
          <DateField
            label="Check-in"
            value={form.checkIn}
            onChange={(checkIn) => {
              update({ checkIn });
            }}
          />
        }
        second={
          <DateField
            label="Check-out"
            value={form.checkOut}
            onChange={(checkOut) => {
              update({ checkOut });
            }}
          />
        }
      />

      <FormRow>
        <CounterField
          label="Rooms"
          icon={<BedDouble />}
          value={form.rooms}
          onChange={(rooms) => {
            update({ rooms });
          }}
        />
        <CounterField
          label="Adults"
          icon={<User />}
          value={form.adults}
          onChange={(adults) => {
            update({ adults });
          }}
        />
      </FormRow>
    </SearchFormLayout>
  );
}
