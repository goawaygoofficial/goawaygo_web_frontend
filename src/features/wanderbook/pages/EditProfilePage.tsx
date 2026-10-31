import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { Avatar } from '../components/People';
import shared from '../components/Wanderbook.module.css';
import { PHOTO_ACCEPT, uploadOriginal } from '../photoUpload';
import { getMyProfile, setProfilePhoto, updateMyProfile } from '../services/wanderbookService';
import type { Profile } from '../types';
import styles from './EditProfilePage.module.css';

/** Edit your Wanderbook profile: photo, cover, bio, home town, and whether it is private. */
export function EditProfilePage() {
  const { user, status, reloadUser } = useUser();
  const goBack = useBack(routes.wanderbook);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState('');
  const [homeTown, setHomeTown] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId === null) return;
    getMyProfile().then(
      (loaded) => {
        setProfile(loaded);
        setBio(loaded.bio);
        setHomeTown(loaded.homeTown);
        setIsPrivate(loaded.isPrivate);
      },
      (cause: unknown) => {
        setMessage(toErrorMessage(cause));
      },
    );
  }, [userId]);

  if (status !== 'restoring' && !user) return <Navigate to={routes.profile} replace />;

  const changePhoto = (kind: 'avatar' | 'cover', file: File | null) => {
    setBusy(kind);
    setMessage(null);
    (file ? uploadOriginal(file).then((uploaded) => uploaded.photo.id) : Promise.resolve(null))
      .then((photoId) => setProfilePhoto(kind, photoId))
      .then((next) => {
        setProfile(next);
        // The profile photo is also the account photo.
        if (kind === 'avatar') void reloadUser();
      })
      .catch((cause: unknown) => {
        setMessage(toErrorMessage(cause));
      })
      .finally(() => {
        setBusy(null);
      });
  };

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.title}>Edit profile</h1>
      </PageHeader>
      {!profile ? (
        <p className={shared.status}>{message ?? 'Loading…'}</p>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            setBusy('save');
            setMessage(null);
            updateMyProfile({ bio: bio.trim(), homeTown: homeTown.trim(), isPrivate })
              .then((next) => {
                setProfile(next);
                setMessage('Saved.');
              })
              .catch((cause: unknown) => {
                setMessage(toErrorMessage(cause));
              })
              .finally(() => {
                setBusy(null);
              });
          }}
        >
          <div className={styles.photos}>
            <div className={styles.photoRow}>
              <Avatar url={profile.photoUrl} size="4.5rem" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => avatarInput.current?.click()}
              >
                {busy === 'avatar' ? 'Uploading…' : 'Change profile photo'}
              </Button>
              {profile.photoUrl && (
                <button
                  type="button"
                  className={styles.link}
                  disabled={busy !== null}
                  onClick={() => {
                    changePhoto('avatar', null);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <div className={styles.photoRow}>
              {profile.coverUrl ? (
                <img src={profile.coverUrl} alt="" className={styles.cover} />
              ) : (
                <span className={styles.cover} />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null}
                onClick={() => coverInput.current?.click()}
              >
                {busy === 'cover' ? 'Uploading…' : 'Change cover'}
              </Button>
              {profile.coverUrl && (
                <button
                  type="button"
                  className={styles.link}
                  disabled={busy !== null}
                  onClick={() => {
                    changePhoto('cover', null);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            {(['avatar', 'cover'] as const).map((kind) => (
              <input
                key={kind}
                ref={kind === 'avatar' ? avatarInput : coverInput}
                type="file"
                accept={PHOTO_ACCEPT}
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  event.target.value = '';
                  if (file) changePhoto(kind, file);
                }}
              />
            ))}
          </div>

          <label className={shared.field}>
            <span className={shared.fieldLabel}>Bio</span>
            <textarea
              maxLength={150}
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
              }}
            />
            <span className={shared.counter}>{bio.length}/150</span>
          </label>
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Home town</span>
            <input
              maxLength={100}
              value={homeTown}
              onChange={(event) => {
                setHomeTown(event.target.value);
              }}
            />
          </label>
          <label className={styles.switchRow}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(event) => {
                setIsPrivate(event.target.checked);
              }}
            />
            <span>
              <span className={shared.fieldLabel}>Private profile</span>
              <span className={shared.muted}>
                {' '}
                Only followers you approve see your posts and lists. Turning it off approves waiting
                requests.
              </span>
            </span>
          </label>

          {message && <p className={shared.muted}>{message}</p>}
          <Button type="submit" size="sm" disabled={busy !== null}>
            {busy === 'save' ? 'Saving…' : 'Save'}
          </Button>
          <p className={styles.more}>
            <Link to={routes.wanderbookRequests}>Follow requests</Link>
            <Link to={routes.wanderbookBlocked}>Blocked people</Link>
            <Link to={routes.communityGuidelines}>Community Guidelines</Link>
          </p>
        </form>
      )}
    </PageShell>
  );
}
