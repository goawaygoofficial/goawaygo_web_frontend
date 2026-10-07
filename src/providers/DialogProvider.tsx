import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { StatusDialog } from '@/components';
import type { StatusDialogKind } from '@/components';
import { DialogContext } from './DialogContext';
import type { DialogContextValue } from './DialogContext';

/** Same as the app's `CustomDialogs`: dialogs dismiss themselves after 3 seconds. */
const AUTO_DISMISS_MS = 3000;

interface ActiveDialog {
  kind: StatusDialogKind;
  message: string;
  resolve: () => void;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveDialog | null>(null);
  const activeRef = useRef<ActiveDialog | null>(null);

  const close = useCallback(() => {
    const current = activeRef.current;
    activeRef.current = null;
    setActive(null);
    current?.resolve();
  }, []);

  const show = useCallback(
    (kind: StatusDialogKind, message: string) =>
      new Promise<void>((resolve) => {
        // Only one dialog at a time: settle any dialog that is still open.
        activeRef.current?.resolve();
        const next = { kind, message, resolve };
        activeRef.current = next;
        setActive(next);
      }),
    [],
  );

  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(close, AUTO_DISMISS_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [active, close]);

  const value = useMemo<DialogContextValue>(
    () => ({
      showSuccess: (message) => show('success', message),
      showError: (message) => show('error', message),
    }),
    [show],
  );

  return (
    <DialogContext value={value}>
      {children}
      <StatusDialog
        open={active !== null}
        kind={active?.kind ?? 'success'}
        message={active?.message ?? ''}
        onClose={close}
      />
    </DialogContext>
  );
}
