import { useEffect, useId, useState } from 'react';
import type { ReactNode, SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@/components';
import { FieldShell } from '@/components/FieldShell/FieldShell';
import { useGoogleCode } from '@/features/auth';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { endSession } from '@/lib/session';
import { useDialog, useUser } from '@/providers';
import type { User } from '@/types';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  getRegions,
  updateDetails,
} from '../services/accountService';
import type { Proof, Regions } from '../types';
import styles from './AccountEditors.module.css';

interface EditorProps {
  user: User;
  /** Closes the form; `message` is shown on the page. */
  onDone: (message: string) => void;
}

/**
 * "Confirm it's you" before a password, email or delete: the current password field, or (accounts without a
 * password) Google's popup when the form is sent. `getProof` resolves null if the popup was closed.
 */
function useProof(user: User): { field: ReactNode; getProof: () => Promise<Proof | null> } {
  const [password, setPassword] = useState('');
  const google = useGoogleCode();
  const field = user.hasPassword ? (
    <TextField
      label="Current password"
      type="password"
      autoComplete="current-password"
      placeholder="Current password"
      value={password}
      onChange={(event) => {
        setPassword(event.target.value);
      }}
    />
  ) : (
    <p className={styles.hint}>
      {google.ready
        ? 'To confirm it’s you, Google asks you to pick your account.'
        : 'Loading Google, which confirms it’s you…'}
    </p>
  );
  // No await before requestCode: the popup must open within the click.
  const getProof = (): Promise<Proof | null> => {
    if (user.hasPassword) {
      if (password.length === 0) return Promise.reject(new Error('Enter your current password.'));
      return Promise.resolve({ password });
    }
    return google.requestCode().then((code) => (code ? { googleCode: code } : null));
  };
  return { field, getProof };
}

/** Sends the form with `action`, showing its error inline. */
function useSubmit(action: () => Promise<void>) {
  const [error, setError] = useState<string | null>(null);
  const [pending, run] = useAsyncAction(async () => {
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(toErrorMessage(cause, 'Something went wrong. Please try again.'));
    }
  });
  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    run();
  };
  return { error, pending, onSubmit };
}

function ErrorText({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className={styles.error}>
      {error}
    </p>
  ) : null;
}

export function NameEditor({ user, onDone }: EditorProps) {
  const { signIn } = useUser();
  const [name, setName] = useState(user.name);
  const { error, pending, onSubmit } = useSubmit(async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) throw new Error('Enter your name.');
    signIn(await updateDetails({ name: trimmed, country: user.country, currency: user.currency }));
    onDone('Name saved. Wanderbook shows it too.');
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="Display name"
        placeholder="Your name"
        autoComplete="name"
        maxLength={100}
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
      />
      <ErrorText error={error} />
      <Button type="submit" size="sm" loading={pending}>
        Save
      </Button>
    </form>
  );
}

/** Loads the country and currency lists once the form opens. */
function useRegions(): { regions: Regions | null; error: string | null } {
  const [regions, setRegions] = useState<Regions | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getRegions().then(
      (loaded) => {
        if (active) setRegions(loaded);
      },
      (cause: unknown) => {
        if (active) setError(toErrorMessage(cause, 'Could not load the list.'));
      },
    );
    return () => {
      active = false;
    };
  }, []);
  return { regions, error };
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <FieldShell tone="solid" caption={<label htmlFor={id}>{label}</label>}>
      <select
        id={id}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function CountryEditor({ user, onDone }: EditorProps) {
  const { signIn } = useUser();
  const { regions, error: loadError } = useRegions();
  const [country, setCountry] = useState(user.country ?? '');
  const { error, pending, onSubmit } = useSubmit(async () => {
    // Picking a country for the first time also picks its currency.
    const currency =
      user.currency ?? regions?.countries.find((c) => c.code === country)?.currency ?? null;
    signIn(await updateDetails({ name: user.name, country: country || null, currency }));
    onDone(country ? 'Country saved.' : 'Country cleared.');
  });
  if (!regions) return <p className={styles.hint}>{loadError ?? 'Loading countries…'}</p>;
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <Select label="Country / Region" value={country} onChange={setCountry}>
        <option value="">Not set</option>
        {regions.countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </Select>
      <ErrorText error={error} />
      <Button type="submit" size="sm" loading={pending}>
        Save
      </Button>
    </form>
  );
}

export function CurrencyEditor({ user, onDone }: EditorProps) {
  const { signIn } = useUser();
  const { regions, error: loadError } = useRegions();
  const [currency, setCurrency] = useState(user.currency ?? '');
  const { error, pending, onSubmit } = useSubmit(async () => {
    signIn(
      await updateDetails({ name: user.name, country: user.country, currency: currency || null }),
    );
    onDone(
      currency
        ? 'Currency saved. Prices will use it as more of GoAwayGo supports it.'
        : 'Currency cleared.',
    );
  });
  if (!regions) return <p className={styles.hint}>{loadError ?? 'Loading currencies…'}</p>;
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <Select label="Currency" value={currency} onChange={setCurrency}>
        <option value="">Not set</option>
        {regions.currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} · {c.name}
            {c.symbol !== c.code ? ` (${c.symbol})` : ''}
          </option>
        ))}
      </Select>
      <ErrorText error={error} />
      <Button type="submit" size="sm" loading={pending}>
        Save
      </Button>
    </form>
  );
}

export function EmailEditor({ user, onDone }: EditorProps) {
  const { signIn } = useUser();
  const [email, setEmail] = useState('');
  const proof = useProof(user);
  const { error, pending, onSubmit } = useSubmit(async () => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      throw new Error('Enter a valid email address.');
    const confirmed = await proof.getProof();
    if (!confirmed) return;
    signIn(await changeEmail(confirmed, trimmed));
    onDone(`We sent a link to ${trimmed}. Your email changes when you open it.`);
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <TextField
        label="New email"
        type="email"
        autoComplete="email"
        placeholder="New email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
      />
      {proof.field}
      <ErrorText error={error} />
      <Button type="submit" size="sm" loading={pending}>
        Send confirmation link
      </Button>
    </form>
  );
}

export function PasswordEditor({ user, onDone }: EditorProps) {
  const { signIn } = useUser();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const proof = useProof(user);
  const { error, pending, onSubmit } = useSubmit(async () => {
    if (password.length < 8 || password.length > 72) {
      throw new Error('The new password must be 8 to 72 characters.');
    }
    if (password !== repeat) throw new Error('The two new passwords don’t match.');
    const confirmed = await proof.getProof();
    if (!confirmed) return;
    signIn(await changePassword(confirmed, password));
    onDone(
      user.hasPassword
        ? 'Password changed. Your other devices were signed out.'
        : 'Password set. You can now also sign in with your email.',
    );
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {proof.field}
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="New password (8+ characters)"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <TextField
        label="Repeat the new password"
        type="password"
        autoComplete="new-password"
        placeholder="Repeat the new password"
        value={repeat}
        onChange={(event) => {
          setRepeat(event.target.value);
        }}
      />
      <ErrorText error={error} />
      <Button type="submit" size="sm" loading={pending}>
        {user.hasPassword ? 'Change password' : 'Set password'}
      </Button>
    </form>
  );
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'in 30 days'
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Delete account: 30 days to change your mind, then everything is gone. */
export function DeleteAccountPanel({ user }: { user: User }) {
  const { showConfirm, showSuccess } = useDialog();
  const navigate = useNavigate();
  const proof = useProof(user);
  const { error, pending, onSubmit } = useSubmit(async () => {
    const confirmed = await proof.getProof();
    if (!confirmed) return;
    const sure = await showConfirm(
      'Delete your GoAwayGo account? You can still keep it by signing in within 30 days.',
      'Delete',
    );
    if (!sure) return;
    const deleteOn = await deleteAccount(confirmed);
    endSession();
    void navigate(routes.profile, { replace: true });
    void showSuccess(
      `Your account will be deleted on ${formatDay(deleteOn)}. Sign in before then to keep it.`,
    );
  });
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <p className={styles.text}>
        Your account is hidden from others and signed out at once. Sign in within 30 days to keep
        it; after that, your posts, photos, trip plans and everything else are deleted for good.
      </p>
      {proof.field}
      <ErrorText error={error} />
      <Button type="submit" size="sm" variant="outline" loading={pending} className={styles.danger}>
        Delete my account
      </Button>
    </form>
  );
}
