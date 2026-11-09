import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@/providers';
import { listSavedPlaces, removeSavedPlace, saveIdea } from '../services/discoverService';
import type { SavedPlace, TripIdea } from '../types';
import { t } from '@/lib/i18n';

export interface SavedPlacesState {
  /** Null while loading (or signed out). */
  places: SavedPlace[] | null;
  error: string | null;
  isSaved: (key: string) => boolean;
  save: (idea: TripIdea) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reload: () => void;
}

/** My Trips for the signed-in user; empty and inactive when signed out. */
export function useSavedPlaces(): SavedPlacesState {
  const { user } = useUser();
  const userId = user?.id ?? null;
  // Tagged with the user they belong to, so another account's list never shows.
  const [loaded, setLoaded] = useState<{
    userId: number;
    places: SavedPlace[] | null;
    error: string | null;
  } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (userId === null) return;
    const controller = new AbortController();
    listSavedPlaces(controller.signal)
      .then((places) => {
        setLoaded({ userId, places, error: null });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const error = cause instanceof Error ? cause.message : t('Could not load My Trips.');
        setLoaded({ userId, places: null, error });
      });
    return () => {
      controller.abort();
    };
  }, [userId, version]);

  const reload = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  const save = useCallback(
    async (idea: TripIdea) => {
      await saveIdea(idea);
      reload();
    },
    [reload],
  );

  const remove = useCallback(async (id: number) => {
    await removeSavedPlace(id);
    setLoaded(
      (current) =>
        current && {
          ...current,
          places: current.places?.filter((place) => place.id !== id) ?? null,
        },
    );
  }, []);

  const mine = loaded !== null && loaded.userId === userId ? loaded : null;
  const places = mine?.places ?? null;
  const error = mine?.error ?? null;

  const isSaved = useCallback(
    (key: string) => places?.some((place) => place.key === key) ?? false,
    [places],
  );

  return { places, error, isSaved, save, remove, reload };
}
