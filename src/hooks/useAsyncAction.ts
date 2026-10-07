import { useCallback, useRef, useState } from 'react';

/**
 * Wraps an async handler with a `pending` flag and ignores re-entry while it runs,
 * so every API-backed button gets the same loading / double-submit behaviour.
 */
export function useAsyncAction<Args extends unknown[]>(
  action: (...args: Args) => Promise<void>,
): [pending: boolean, run: (...args: Args) => void] {
  const [pending, setPending] = useState(false);
  const runningRef = useRef(false);

  const run = useCallback(
    (...args: Args) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setPending(true);
      void action(...args).finally(() => {
        runningRef.current = false;
        setPending(false);
      });
    },
    [action],
  );

  return [pending, run];
}
