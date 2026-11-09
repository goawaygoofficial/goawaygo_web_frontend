import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import userProfileIcon from '@/assets/icons/user_profile.png';
import { Button, ButtonLink, PageHeader, PageShell } from '@/components';
import { useSignOut } from '@/features/auth';
import { Avatar, PHOTO_ACCEPT, setProfilePhoto, uploadOriginal } from '@/features/wanderbook';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import {
  CountryEditor,
  CurrencyEditor,
  DeleteAccountPanel,
  EmailEditor,
  NameEditor,
  PasswordEditor,
} from '../components/AccountEditors';
import { EditableField } from '../components/EditableField';
import styles from './UserProfilePage.module.css';

const NOT_SET = 'Not set';

type Editing = 'name' | 'email' | 'password' | 'country' | 'currency' | 'delete' | null;

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function countryName(code: string | null): string {
  if (!code) return NOT_SET;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * The account (Me, 4.6): photo and name (the same as on Wanderbook), email, password, country and currency, each
 * changed in place; notification settings, sign out, and delete account.
 */
export function UserProfilePage() {
  const { user, reloadUser } = useUser();
  const goBack = useBack(routes.profile);
  const { signOut, pending: signingOut, leaving } = useSignOut();
  const [editing, setEditing] = useState<Editing>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  // While signing out, render nothing instead of redirecting (see `useSignOut`'s `leaving`).
  if (!user) return leaving ? null : <Navigate to={routes.profile} replace />;

  const toggle = (field: Exclude<Editing, null>) => () => {
    setMessage(null);
    setEditing((open) => (open === field ? null : field));
  };
  const done = (text: string) => {
    setEditing(null);
    setMessage(text);
  };
  const changePhoto = (file: File | null) => {
    setPhotoBusy(true);
    setMessage(null);
    (file ? uploadOriginal(file).then((uploaded) => uploaded.photo.id) : Promise.resolve(null))
      .then((photoId) => setProfilePhoto('avatar', photoId))
      .then(() => reloadUser())
      .then(() => {
        setMessage(file ? 'Photo changed. Wanderbook shows it too.' : 'Photo removed.');
      })
      .catch((cause: unknown) => {
        setMessage(toErrorMessage(cause, 'Could not change the photo.'));
      })
      .finally(() => {
        setPhotoBusy(false);
      });
  };

  return (
    <PageShell>
      <PageHeader>
        <h1 className={styles.title}>
          <img src={userProfileIcon} alt="" className={styles.titleIcon} />
          User Profile
        </h1>
      </PageHeader>

      <div className={styles.photo}>
        <Avatar url={user.profilePicture} size="5rem" />
        <div className={styles.photoActions}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={photoBusy}
            onClick={() => photoInput.current?.click()}
          >
            {photoBusy ? 'Uploading…' : 'Change photo'}
          </Button>
          {user.profilePicture && !photoBusy && (
            <Button
              type="button"
              size="sm"
              variant="link"
              onClick={() => {
                changePhoto(null);
              }}
            >
              Remove
            </Button>
          )}
        </div>
        <input
          ref={photoInput}
          type="file"
          accept={PHOTO_ACCEPT}
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = '';
            if (file) changePhoto(file);
          }}
        />
      </div>

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <div className={styles.fields}>
        <EditableField
          label="Display Name"
          value={user.name}
          open={editing === 'name'}
          onToggle={toggle('name')}
        >
          <NameEditor user={user} onDone={done} />
        </EditableField>
        <EditableField
          label="Email"
          value={user.email}
          note={
            user.pendingEmail
              ? `Waiting for you to open the link sent to ${user.pendingEmail}.`
              : undefined
          }
          open={editing === 'email'}
          onToggle={toggle('email')}
          editLabel="Change"
        >
          <EmailEditor user={user} onDone={done} />
        </EditableField>
        <EditableField
          label="Password"
          value={user.hasPassword ? '**************' : 'Google sign-in'}
          isSecret={user.hasPassword}
          open={editing === 'password'}
          onToggle={toggle('password')}
          editLabel={user.hasPassword ? 'Change' : 'Set'}
        >
          <PasswordEditor user={user} onDone={done} />
        </EditableField>
        <EditableField label="Phone Number" value={user.phone ?? NOT_SET} />
        <EditableField
          label="Country / Region"
          value={countryName(user.country)}
          open={editing === 'country'}
          onToggle={toggle('country')}
        >
          <CountryEditor user={user} onDone={done} />
        </EditableField>
        <EditableField
          label="Currency"
          value={user.currency ?? NOT_SET}
          open={editing === 'currency'}
          onToggle={toggle('currency')}
        >
          <CurrencyEditor user={user} onDone={done} />
        </EditableField>
      </div>

      <div className={styles.actions}>
        <ButtonLink fullWidth variant="outline" to={routes.notificationSettings}>
          Notification settings
        </ButtonLink>
        <Button fullWidth loading={signingOut} onClick={signOut}>
          Sign Out
        </Button>
        <Button variant="link" onClick={goBack}>
          Back
        </Button>
      </div>

      <section className={styles.danger} aria-label="Delete account">
        <button
          type="button"
          className={styles.dangerToggle}
          aria-expanded={editing === 'delete'}
          onClick={toggle('delete')}
        >
          {editing === 'delete' ? 'Keep my account' : 'Delete account'}
        </button>
        {editing === 'delete' && <DeleteAccountPanel user={user} />}
      </section>
    </PageShell>
  );
}
