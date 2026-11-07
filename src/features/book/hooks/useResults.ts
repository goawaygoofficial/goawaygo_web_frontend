import { useCallback, useEffect, useState } from 'react';

export type ResultsState<T> =
  { kind: 'loading' } | { kind: 'ready'; data: T } | { kind: 'error'; message: string };

/**
 * Loads one search's results. `key` identifies the search (its URL query); a new key starts a new request and the
 * older answer is ignored.
 */
export function useResults<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
  fallbackError: string,
): { state: ResultsState<T>; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  // Each result remembers the request it answers; anything older counts as still loading.
  const requestKey = `${key}|${String(attempt)}`;
  const [result, setResult] = useState<{ requestKey: string; state: ResultsState<T> } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal)
      .then((data) => {
        setResult({ requestKey, state: { kind: 'ready', data } });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          requestKey,
          state: {
            kind: 'error',
            message: cause instanceof Error && cause.message ? cause.message : fallbackError,
          },
        });
      });
    return () => {
      controller.abort();
    };
    // `load` is rebuilt every render; the search it runs is identified by `requestKey`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, fallbackError]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  const state: ResultsState<T> =
    result?.requestKey === requestKey ? result.state : { kind: 'loading' };
  return { state, retry };
}
