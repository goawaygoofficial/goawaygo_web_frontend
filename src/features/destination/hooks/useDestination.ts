import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/apiClient';
import { getDestination, rememberSearch } from '@/features/discover';
import type { DestinationPage, DestinationQuery } from '@/features/discover';
import { useUser } from '@/providers';
import { t } from '@/lib/i18n';

export type DestinationState =
  | { kind: 'loading' }
  | { kind: 'ready'; page: DestinationPage }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

/**
 * Loads a destination page once the session is known (so a signed-in search goes into the account's recent
 * searches). Signed out, the search is remembered on this device instead.
 */
export function useDestination(query: DestinationQuery): {
  state: DestinationState;
  retry: () => void;
} {
  const { user, status } = useUser();
  const signedIn = user !== null;
  const [attempt, setAttempt] = useState(0);
  const key = 'placeId' in query ? `id:${query.placeId}` : `q:${query.text}`;
  // Each result remembers the request it answers; anything older counts as still loading.
  const requestKey = `${key}|${String(attempt)}|${String(signedIn)}`;
  const [result, setResult] = useState<{ requestKey: string; state: DestinationState } | null>(
    null,
  );

  useEffect(() => {
    if (status === 'restoring') return;
    const controller = new AbortController();
    const setState = (state: DestinationState) => {
      setResult({ requestKey, state });
    };
    const request: DestinationQuery = key.startsWith('id:')
      ? { placeId: key.slice(3) }
      : { text: key.slice(2) };
    getDestination(request, controller.signal)
      .then((page) => {
        setState({ kind: 'ready', page });
        if (!signedIn && page.status !== 'unknown') rememberSearch(page.place, page.spots[0]?.name);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        if (cause instanceof ApiError && cause.status === 404) {
          setState({ kind: 'notFound' });
        } else {
          setState({
            kind: 'error',
            message: cause instanceof Error ? cause.message : t('Could not open this destination.'),
          });
        }
      });
    return () => {
      controller.abort();
    };
  }, [key, signedIn, status, requestKey]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const state: DestinationState =
    result?.requestKey === requestKey ? result.state : { kind: 'loading' };
  return { state, retry };
}
