import { useCallback, useEffect, useState } from 'react';
import type { Page } from '../types';
import { t } from '@/lib/i18n';

export interface Paged<T> {
  /** Null while the first page loads. */
  items: T[] | null;
  error: string | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  /** Changes the loaded items in place (after a like, delete, ...). */
  update: (change: (items: T[]) => T[]) => void;
}

/**
 * A list loaded page by page ("Load more"). Reloads from the start when `key` changes. Results are tagged with the
 * key they belong to, so an older answer never shows under a newer key.
 */
export function usePaged<T>(
  key: string,
  load: (cursor: number | null, signal: AbortSignal) => Promise<Page<T>>,
): Paged<T> {
  const [state, setState] = useState<{
    key: string;
    items: T[] | null;
    cursor: number | null;
    error: string | null;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    load(null, controller.signal)
      .then((page) => {
        setState({ key, items: page.items, cursor: page.nextCursor, error: null });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const error = cause instanceof Error ? cause.message : t('Could not load.');
        setState({ key, items: null, cursor: null, error });
      });
    return () => {
      controller.abort();
    };
    // `load` is recreated on every render; `key` says when the list itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const mine = state?.key === key ? state : null;

  const loadMore = useCallback(() => {
    if (!mine?.cursor || loadingMore) return;
    setLoadingMore(true);
    load(mine.cursor, new AbortController().signal)
      .then((page) => {
        setState((current) =>
          current?.key === key
            ? {
                ...current,
                items: [...(current.items ?? []), ...page.items],
                cursor: page.nextCursor,
              }
            : current,
        );
      })
      .catch(() => {
        // Keep what is shown; the button stays to try again.
      })
      .finally(() => {
        setLoadingMore(false);
      });
  }, [mine, loadingMore, load, key]);

  const update = useCallback(
    (change: (items: T[]) => T[]) => {
      setState((current) =>
        current?.key === key && current.items
          ? { ...current, items: change(current.items) }
          : current,
      );
    },
    [key],
  );

  return {
    items: mine?.items ?? null,
    error: mine?.error ?? null,
    hasMore: Boolean(mine?.cursor),
    loadingMore,
    loadMore,
    update,
  };
}
