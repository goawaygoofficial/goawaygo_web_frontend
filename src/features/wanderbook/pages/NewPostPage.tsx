import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Icon, PageHeader, PageShell } from '@/components';
import { useBack } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { PlaceFields } from '../components/PlaceFields';
import shared from '../components/Wanderbook.module.css';
import { PHOTO_ACCEPT, uploadOriginal } from '../photoUpload';
import { createPost } from '../services/wanderbookService';
import type { Photo, PlaceTag } from '../types';
import styles from './NewPostPage.module.css';

const MAX_PHOTOS = 10;
const MAX_CAPTION = 2200;

interface Selected {
  key: string;
  name: string;
  preview: string;
  status: 'uploading' | 'done' | 'error';
  photo?: Photo;
  error?: string;
}

/**
 * New post: 1 to 10 photos (uploaded as originals one by one while you write), a caption and a place tag filled
 * in from the first photo's location.
 */
export function NewPostPage() {
  const { user, status } = useUser();
  const navigate = useNavigate();
  const goBack = useBack(routes.wanderbook);
  const input = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [caption, setCaption] = useState('');
  const [place, setPlace] = useState<PlaceTag | null>(null);
  const [placeFromPhoto, setPlaceFromPhoto] = useState(false);
  const placeTouched = useRef(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Free the preview images when leaving.
  const previews = useRef<string[]>([]);
  useEffect(
    () => () => {
      previews.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    },
    [],
  );

  if (status !== 'restoring' && !user) return <Navigate to={routes.profile} replace />;

  const change = (key: string, update: Partial<Selected>) => {
    setSelected((items) => items.map((item) => (item.key === key ? { ...item, ...update } : item)));
  };

  const add = async (files: File[]) => {
    const room = MAX_PHOTOS - selected.length;
    const batch = files.slice(0, room).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return {
        file,
        item: { key: crypto.randomUUID(), name: file.name, preview, status: 'uploading' as const },
      };
    });
    if (files.length > room) setError(`A post has up to ${String(MAX_PHOTOS)} photos.`);
    setSelected((items) => [...items, ...batch.map((b) => b.item)]);
    // One at a time: originals can be large.
    for (const { file, item } of batch) {
      try {
        const uploaded = await uploadOriginal(file);
        change(item.key, { status: 'done', photo: uploaded.photo });
        if (uploaded.suggestedPlace && !placeTouched.current) {
          placeTouched.current = true;
          setPlace(uploaded.suggestedPlace);
          setPlaceFromPhoto(true);
        }
      } catch (cause) {
        change(item.key, { status: 'error', error: toErrorMessage(cause) });
      }
    }
  };

  const ready = selected.filter((item) => item.status === 'done');
  const busy = selected.some((item) => item.status === 'uploading');

  return (
    <PageShell>
      <PageHeader onBack={goBack}>
        <h1 className={styles.title}>New post</h1>
      </PageHeader>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          setPosting(true);
          setError(null);
          createPost({
            photoIds: ready.map((item) => item.photo?.id ?? ''),
            caption: caption.trim(),
            place,
          })
            .then((post) => {
              void navigate(routes.wanderbookPost(post.publicId), { replace: true });
            })
            .catch((cause: unknown) => {
              setError(toErrorMessage(cause));
              setPosting(false);
            });
        }}
      >
        <ul className={styles.photos} aria-label="Photos in this post">
          {selected.map((item) => (
            <li key={item.key} className={styles.photo}>
              <img src={item.preview} alt={item.name} />
              {item.status !== 'done' && (
                <span className={styles.badge}>
                  {item.status === 'uploading' ? 'Uploading…' : item.error}
                </span>
              )}
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${item.name}`}
                onClick={() => {
                  setSelected((items) => items.filter((i) => i.key !== item.key));
                }}
              >
                <Icon name="close_rounded" />
              </button>
            </li>
          ))}
          {selected.length < MAX_PHOTOS && (
            <li>
              <button
                type="button"
                className={styles.addPhoto}
                onClick={() => input.current?.click()}
              >
                <Icon name="add_a_photo" />
                {selected.length === 0 ? 'Add photos' : 'Add more'}
              </button>
            </li>
          )}
        </ul>
        <input
          ref={input}
          type="file"
          accept={PHOTO_ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            void add(files);
          }}
        />
        <p className={shared.muted}>
          Photos are kept exactly as they are. Their hidden location data is removed; only the place
          name below is shown.
        </p>

        <label className={shared.field}>
          <span className={shared.fieldLabel}>Caption</span>
          <textarea
            maxLength={MAX_CAPTION}
            value={caption}
            placeholder="Write about this trip…"
            onChange={(event) => {
              setCaption(event.target.value);
            }}
          />
          <span className={shared.counter}>
            {caption.length}/{MAX_CAPTION}
          </span>
        </label>

        <PlaceFields
          value={place}
          fromPhoto={placeFromPhoto}
          onChange={(next) => {
            placeTouched.current = true;
            setPlaceFromPhoto(false);
            setPlace(next);
          }}
        />

        {error && <p className={shared.error}>{error}</p>}
        <button
          type="submit"
          className={shared.pillButton}
          disabled={ready.length === 0 || busy || posting}
        >
          {posting ? 'Posting…' : busy ? 'Uploading photos…' : 'Share'}
        </button>
      </form>
    </PageShell>
  );
}
